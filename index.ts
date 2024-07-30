import {
  isWithCustomOptions,
  isWithMediaUrl,
  PlayerAnalytics,
  PlayerAnalyticsOptions,
} from "@api.video/player-analytics";
import videojs, { VideoJsPlayer } from "video.js";

const Plugin = videojs.getPlugin("plugin");

declare module "video.js" {
  // this tells the type system that the VideoJsPlayer object has a method seekButtons
  export interface VideoJsPlayer {
    apiVideoAnalytics(options?: VideoJsApiVideoAnalyticsOptions): void;
  }
}

export class VideoJsApiVideoAnalytics extends Plugin {
  private options: VideoJsApiVideoAnalyticsOptions;
  private isFirstInit = true;
  private lastSegmentBandwidth = 0;
  private playerAnalytics!: PlayerAnalytics;
  private passthrough: boolean = false;
  private lastMediaUrl?: string = undefined;

  constructor(player: VideoJsPlayer, options: VideoJsApiVideoAnalyticsOptions) {
    super(player);

    this.options = options || {};
    if (!isWithCustomOptions(this.options) && !isWithMediaUrl(this.options)) {
      player.on("loadstart", (_) => {
        const src = player.src();
        if (this.isApiVideoMediaUrl(src)) {
          this.passthrough = false;
          if (this.lastMediaUrl !== src) {
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

    this.playerAnalytics = new PlayerAnalytics({
      ...options,
    });

    const videoElt = this.player.el().querySelector("video");
    if (videoElt) {
      this.playerAnalytics.ovbserveMedia(videoElt);
    } else {
      console.error("No video element found in the player");
    }

    this.player.ready(() => {
      if (this.isFirstInit) {
        events.forEach((eventName) =>
          this.player.on(eventName, (event: any) =>
            this.handleEvent(eventName, event)
          )
        );
      }

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
      if (tracks[i].label === "segment-metadata") {
        const segmentMetadataTrack = tracks[i] as any;

        segmentMetadataTrack.on("cuechange", () => {
          const activeCue = segmentMetadataTrack.activeCues[0];

          if (!activeCue?.value) {
            return;
          }

          this.handleEvent("segmentchange", activeCue.value);

          if (this.lastSegmentBandwidth !== activeCue.value.bandwidth) {
            this.lastSegmentBandwidth = activeCue.value.bandwidth;
            this.handleEvent("qualitychange", activeCue.value.resolution);
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

    if (this.options.onEvent && eventName === "loadedmetadata") {
      this.options.onEvent({ type: "ready" });
      this.initSegmentsWatcher();
    }

    if (this.options.onEvent) {
      this.options.onEvent({
        type: eventName,
        ...(eventName === "timeupdate"
          ? { currentTime: this.player.currentTime() }
          : {}),
        ...(eventName === "volumechange"
          ? { volume: this.player.volume() }
          : {}),
        ...(eventName === "segmentchange" ? { segment: event } : {}),
        ...(eventName === "qualitychange" ? { resolution: event } : {}),
      });
    }
  }
}

const events = [
  "controlsdisabled",
  "controlsenabled",
  "dispose",
  "durationchange",
  "ended",
  "enterFullWindow",
  "enterpictureinpicture",
  "error",
  "exitFullWindow",
  "firstplay",
  "fullscreenchange",
  "leavepictureinpicture",
  "loadedmetadata",
  "loadstart",
  "pause",
  "play",
  "playerreset",
  "playerresize",
  "playing",
  "posterchange",
  "ratechange",
  "ready",
  "resize",
  "seeked",
  "seeking",
  "textdata",
  "timeupdate",
  "useractive",
  "userinactive",
  "volumechange",
  "waiting",
];

export type VideoJsApiVideoAnalyticsOptions = PlayerAnalyticsOptions & {
  onEvent?: (event: any) => void;
};

type VideoQuality = {
  width: number;
  height: number;
  bandwidth: number;
};
