module.exports = {
    entry: {
        "videojs-player-analytics": ['core-js/stable/promise', 'url-polyfill', './index.ts']
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            },
        ],
    },
    externals: {
        "video.js": {
            'root': "videojs",
            "amd": "video.js",
            "commonjs": "video.js",
            "commonjs2": "video.js"
        }
    },
    resolve: {
        extensions: ['.ts', '.js'],
    },
    output: {
        libraryTarget: 'umd',
        filename: 'index.js',
        globalObject: 'this',
        environment: {
            arrowFunction: false
        }
    }
};
