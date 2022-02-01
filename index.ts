import { isWithCustomOptions, isWithMediaUrl, PlayerAnalytics, PlayerAnalyticsOptions } from '@api.video/player-analytics';
import videojs, { VideoJsPlayer } from 'video.js';

const Plugin = videojs.getPlugin('plugin');

declare module 'video.js' {
    // this tells the type system that the VideoJsPlayer object has a method seekButtons
    export interface VideoJsPlayer {
        apiVideoAnalytics(options?: VideoJsApiVideoAnalyticsOptions): void;
    }
}

export class VideoJsApiVideoAnalytics extends Plugin {
    private lastPlayingTime: number | undefined;
    private beforeLastPlayingTime: number | undefined;
    private wasSeeking: boolean = false;
    private isFirstPlay = true;
    private options: VideoJsApiVideoAnalyticsOptions;
    private skipNextSeek = false;
    private isFirstInit = true;
    private lastSegmentBandwidth = 0;
    private playerAnalytics!: PlayerAnalytics;
    private passthrough: boolean = false;
    private lastMediaUrl?: string = undefined;

    constructor(player: VideoJsPlayer, options: VideoJsApiVideoAnalyticsOptions) {
        super(player);

        this.options = options || {};
        if (!isWithCustomOptions(this.options) && !isWithMediaUrl(this.options)) {
            player.on('loadstart', (_) => {
                const src = player.src();
                if (this.isApiVideoMediaUrl(src)) {
                    this.passthrough = false;
                    if(this.lastMediaUrl !== src) {
                        (this.options as any).mediaUrl = src;
                        this.setOptions(this.options);
                        this.lastMediaUrl = src;
                    }
                } else {
                    this.passthrough = true;
                }
            });
        } else {
            this.setOptions(this.options);
        }
    }

    public setOptions(options: VideoJsApiVideoAnalyticsOptions) {
        this.options = options;
        this.isFirstPlay = true;

        if (this.playerAnalytics) {
            this.playerAnalytics.destroy();
        }

        this.playerAnalytics = new PlayerAnalytics({
            ...options
        });

        this.player.ready(() => {
            if (this.isFirstInit) {
                events.forEach(eventName => this.player.on(eventName, (event: any) => this.handleEvent(eventName, event)));
                window.addEventListener('beforeunload', (e) => this.playerAnalytics.destroy());
            }

            if (!!options.sequence) {
                this.skipNextSeek = true;
            }

            this.playerAnalytics.updateTime(options.sequence?.start || 0);
            this.playerAnalytics.ready();

            this.isFirstInit = false;
        });
    }

    private isApiVideoMediaUrl(mediaUrl: string): boolean {
        try {
            PlayerAnalytics.parseMediaUrl(mediaUrl);
            return true;
        } catch (e: any) {
            return false;
        }
    }

    private initSegmentsWatcher() {
        const tracks = this.player.textTracks();

        if (!tracks) {
            return;
        }

        // tslint:disable-next-line
        for (let i = 0; i < tracks.length; i++) {
            if (tracks[i].label === 'segment-metadata') {
                const segmentMetadataTrack = tracks[i] as any;

                segmentMetadataTrack.on('cuechange', () => {
                    const activeCue = segmentMetadataTrack.activeCues[0];

                    if (!activeCue?.value) {
                        return;
                    }

                    this.handleEvent('segmentchange', activeCue.value);

                    if (this.lastSegmentBandwidth !== activeCue.value.bandwidth) {
                        this.lastSegmentBandwidth = activeCue.value.bandwidth;
                        this.handleEvent('qualitychange', activeCue.value.resolution);
                    }

                });
                return;
            }
        }
    }

    private handleEvent(eventName: string, event: any) {
        if (this.passthrough) {
            return;
        }

        if (this.options.onEvent && eventName === 'loadedmetadata') {
            this.options.onEvent({ type: 'ready' });
            this.initSegmentsWatcher();
        }

        if (eventName === 'timeupdate') {
            this.playerAnalytics.updateTime(this.player.currentTime());
            if (!this.player.paused()) {
                this.beforeLastPlayingTime = this.lastPlayingTime;
                this.lastPlayingTime = this.player.currentTime();
            }
        }

        if (eventName === 'dispose') {
            this.playerAnalytics.destroy();
        }

        if (eventName === 'play') {
            if (this.wasSeeking) {
                if (!this.skipNextSeek) {
                    const endSeeking = this.player.currentTime();
                    const startSeeking = this.lastPlayingTime === endSeeking ? this.beforeLastPlayingTime : this.lastPlayingTime;
                    this.playerAnalytics.seek(startSeeking as number, endSeeking);
                } else {
                    this.skipNextSeek = false;
                }
                this.wasSeeking = false;
            }

            if (this.isFirstPlay) {
                this.playerAnalytics.play();
                this.isFirstPlay = false;
            } else {
                this.playerAnalytics.resume();
            }
        }

        if (eventName === 'pause') {
            if (this.player.currentTime() !== this.player.duration()) {
                this.playerAnalytics.pause();
            }
        }

        if (eventName === 'seeking') {
            this.wasSeeking = true;
        }

        if (eventName === 'ended') {
            this.playerAnalytics.end();
        }

        if (this.options.onEvent) {
            this.options.onEvent({
                type: eventName,
                ...(eventName === 'timeupdate' ? { currentTime: this.player.currentTime() } : {}),
                ...(eventName === 'volumechange' ? { volume: this.player.volume() } : {}),
                ...(eventName === 'segmentchange' ? { segment: event } : {}),
                ...(eventName === 'qualitychange' ? { resolution: event } : {}),
            });
        }
    }
}


const events = [
    'controlsdisabled',
    'controlsenabled',
    'dispose',
    'durationchange',
    'ended',
    'enterFullWindow',
    'enterpictureinpicture',
    'error',
    'exitFullWindow',
    'firstplay',
    'fullscreenchange',
    'leavepictureinpicture',
    'loadedmetadata',
    'loadstart',
    'pause',
    'play',
    'playerreset',
    'playerresize',
    'playing',
    'posterchange',
    'ratechange',
    'ready',
    'resize',
    'seeked',
    'seeking',
    'textdata',
    'timeupdate',
    'useractive',
    'userinactive',
    'volumechange',
    'waiting',
];

export type VideoJsApiVideoAnalyticsOptions = PlayerAnalyticsOptions & {
    onEvent?: (event: any) => void;
}

type VideoQuality = {
    width: number;
    height: number;
    bandwidth: number;
}