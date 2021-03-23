import { VideoJsApiVideoAnalytics } from '@api.video/videojs-player-analytics';
import videojs from 'video.js';

videojs.registerPlugin('apiVideoAnalytics', VideoJsApiVideoAnalytics);
const player = videojs('myvideo');
player.apiVideoAnalytics();
player.src("https://cdn.api.video/vod/vi5oDagRVJBSKHxSiPux5rYD/hls/manifest.m3u8");
