![](https://github.com/apivideo/API_OAS_file/blob/master/apivideo_banner.png)

# api.video player analytics plugin for videojs

video.js plugin to call the api.video analytics collector. 

# Plugin usage

## Installation method #1: requirejs

If you use requirejs you can add the plugin as a dependency to your project with 

```sh
$ npm install --save @api.video/videojs-player-analytics
```

You can then use the plugin in your script: 

```javascript
var videojs = require('video.js');
var { VideoJsApiVideoAnalytics } = require('@api.video/videojs-player-analytics');

videojs.registerPlugin('apiVideoAnalytics', VideoJsApiVideoAnalytics);
const player = videojs('my-video');
player.apiVideoAnalytics();
```

## Installation method #2: typescript

If you use Typescript you can add the plugin as a dependency to your project with 

```sh
$ npm install --save @api.video/videojs-player-analytics
```

You can then use the plugin in your script: 

```typescript
import videojs from 'video.js';
import { VideoJsApiVideoAnalytics } from '@api.video/videojs-player-analytics';

videojs.registerPlugin('apiVideoAnalytics', VideoJsApiVideoAnalytics);
const player = videojs('my-video');
player.apiVideoAnalytics();


```

## Simple include in a javascript project

Include the plugin in your HTML file like so:

```html
<html>
    <head>
        <link href="https://vjs.zencdn.net/7.10.2/video-js.css" rel="stylesheet" />
        <script src="https://vjs.zencdn.net/7.10.2/video.min.js"></script>
        <script src="https://unpkg.com/@api.video/videojs-player-analytics"></script>
    </head>
    
    <body>
    
        <video id='video-example' class="video-js vjs-default-skin" width="400" height="300" controls>
            <source type="application/x-mpegURL" src="https://cdn.api.video/vod/vi5oDagRVJBSKHxSiPux5rYD/hls/manifest.m3u8">
        </video>
    
        <script>
            videojs.registerPlugin('apiVideoAnalytics', VideoJsApiVideoAnalytics);
            
            var player = videojs('video-example');
            player.apiVideoAnalytics();
        </script>
    </body>
</html>
```