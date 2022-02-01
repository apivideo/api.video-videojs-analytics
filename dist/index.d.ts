import { PlayerAnalyticsOptions } from '@api.video/player-analytics';
import videojs, { VideoJsPlayer } from 'video.js';
declare const Plugin: {
    new (player: VideoJsPlayer, options?: any): videojs.Plugin;
    prototype: videojs.Plugin;
    BASE_PLUGIN_NAME: string;
    deregisterPlugin(name: string): void;
    getPlugin(name: string): any;
    getPluginVersion(name: string): string;
    getPlugins(names?: string[] | undefined): {
        [name: string]: videojs.Plugin;
    };
    isBasic(plugin: string | (() => any)): boolean;
    registerPlugin<T, K>(name: string, plugin: (this: VideoJsPlayer, ...options: K[]) => T): (...options: K[]) => T;
    registerPlugin<T_1 extends any>(name: string, plugin: T_1): () => T_1;
};
declare module 'video.js' {
    interface VideoJsPlayer {
        apiVideoAnalytics(options?: VideoJsApiVideoAnalyticsOptions): void;
    }
}
export declare class VideoJsApiVideoAnalytics extends Plugin {
    private lastPlayingTime;
    private beforeLastPlayingTime;
    private wasSeeking;
    private isFirstPlay;
    private options;
    private skipNextSeek;
    private isFirstInit;
    private lastSegmentBandwidth;
    private playerAnalytics;
    private passthrough;
    private lastMediaUrl?;
    constructor(player: VideoJsPlayer, options: VideoJsApiVideoAnalyticsOptions);
    setOptions(options: VideoJsApiVideoAnalyticsOptions): void;
    private isApiVideoMediaUrl;
    private initSegmentsWatcher;
    private handleEvent;
}
export declare type VideoJsApiVideoAnalyticsOptions = PlayerAnalyticsOptions & {
    onEvent?: (event: any) => void;
};
export {};
