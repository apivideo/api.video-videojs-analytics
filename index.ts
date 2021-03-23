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

    private playerAnalytics!: PlayerAnalytics;

    constructor(player: VideoJsPlayer, options: VideoJsApiVideoAnalyticsOptions) {
        super(player);

        this.options = options || {};

        if (!isWithCustomOptions(this.options) && !isWithMediaUrl(this.options)) {
            player.on('loadstart', (_) => {
                (this.options as any).mediaUrl = player.src();
                this.setOptions(this.options);
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


    private handleEvent(eventName: string, event: any) {

        if (this.options.onEvent && eventName === 'loadedmetadata') {
            this.options.onEvent({ type: 'ready' });
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

        if (this.options.onEvent && relayedEvents.indexOf(eventName) > -1) {
            this.options.onEvent({ type: eventName });
        }
    }
}


const events = [
    'dispose',
    'durationchange',
    'ended',
    'enterpictureinpicture',
    'error',
    'firstplay',
    'fullscreenchange',
    'leavepictureinpicture',
    'loadstart',
    'pause',
    'play',
    'playerreset',
    'playerresize',
    'posterchange',
    'ratechange',
    'ready',
    'seeking',
    'timeupdate',
    'waiting',
    'loadedmetadata',
]

const relayedEvents = [
    'ended',
    'error',
    'firstplay',
    'fullscreenchange',
    'loadstart',
    'pause',
    'play',
    'playerresize',
    'ready',
    'seeking',
    'waiting',
];

export type VideoJsApiVideoAnalyticsOptions = PlayerAnalyticsOptions & {
    onEvent?: (event: any) => void;
}