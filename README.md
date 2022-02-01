[![badge](https://img.shields.io/twitter/follow/api_video?style=social)](https://twitter.com/intent/follow?screen_name=api_video) &nbsp; [![badge](https://img.shields.io/github/stars/apivideo/api.video-videojs-analytics?style=social)](https://github.com/apivideo/api.video-videojs-analytics) &nbsp; [![badge](https://img.shields.io/discourse/topics?server=https%3A%2F%2Fcommunity.api.video)](https://community.api.video)
![](https://github.com/apivideo/API_OAS_file/blob/master/apivideo_banner.png)
![npm](https://img.shields.io/npm/v/@api.video/videojs-player-analytics) ![ts](https://badgen.net/badge/-/TypeScript/blue?icon=typescript&label)
<h1 align="center">api.video videojs analytics plugin</h1>

[api.video](https://api.video) is the video infrastructure for product builders. Lightning fast video APIs for integrating, scaling, and managing on-demand & low latency live streaming features in your app.


# Table of contents

- [Table of contents](#table-of-contents)
- [Project description](#project-description)
- [Getting started](#getting-started)
  - [Installation](#installation)
    - [Method #1: requirejs](#method-1-requirejs)
    - [Method #2: typescript](#method-2-typescript)
    - [Method #3: simple include in a javascript project](#method-3-simple-include-in-a-javascript-project)

# Project description

video.js plugin to call the api.video analytics collector. 

# Getting started

## Installation 

### Method #1: requirejs

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

### Method #2: typescript

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

### Method #3: simple include in a javascript project

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
