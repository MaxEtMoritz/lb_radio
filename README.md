# LB Radio
*Utility to submit listens to ListenBrainz done with a dumb radio receiver*

## About the Project

LB Radio is a utility to submit your radio listening activity to ListenBrainz.

Since most dedicated radio receivers (i'm not talking about web radio applications or Websites for listening to Internet radio streams) are dumb devices without internet connection there is no
good way to submit listens done with them.

This is where this project kicks in: When turning on the radio receiver, you can search for the radio station on here and click "Start listening". All songs this radio station is playing are
now submitted to ListenBrainz until you click "Stop listening" again.

## Current project state

The project is not yet finished, it's a WIP. It also isn't hosted somewhere to try it out (yet).

When i have time and feel like working on the project i will continue with it, otherwise it may never get finished and hosted somewhere.

## How to help?
- report issues and missing features
- help fixing reported issues via pull requests
- help adding new features via pull requests

## Project architecture

Project consists of a front-end in plain HTML and JS and a back-End NodeJS Server (mostly due to the fact that most internet radio streams don't implement CORS or don't allow every site).

The Back-End Server's Job is to query the web radio Stream URL for Metadata and deliver what was found to the front-end.

The front-end does everything else: Look up radio stations and their Stream URLs in the RadioBrowser API, process the metadata string from the stream server to split it up into an artist and title part, periodically query the Back-end server for metadata, ...

## Development setup

Prerequisite to the following steps is a working NodeJS setup on your machine.

To start the development on this project, clone this repository to your machine first.

After that, cd into the repository's root directory and install the dependencies by
```console
npm install
```

After that you can modify the source files of the project, [compile it](#compiling-the-project) and [start the server](#running-the-server) to see if the changes you made had the desired effect.

### Compiling the project
The project is using Webpack to bundle the front-end. After modifying the source files, you can compile by running
```console
npm run build
```

### Running the server
To start the NodeJS server, run
```console
npm run serve
```

## Licenses

Licenses of third party packages can be obtained with the help of the NPM package `license-checker` as follows:
```console
npx license-checker
```

Additionally, a modified copy of the npm package `icecast-metadata-stats` (Licensed under [LGPL 3.0 or later](https://github.com/eshaz/icecast-metadata-js/blob/4a29e02540d282e9427ea1aabfbf664104765888/src/icecast-metadata-stats/LICENSE) license, © 2021 Ethan Halsall) is used.

The modifications include, but may not be limited to:

- add checks for content type before reading downloaded data as text to safeguard against blocking endlessly because the data is an endless audio stream
- add support for another stream service: StreaMonkey

To view all modifications that were made, compare [this file](server/IcecastMetadataStats.js) with [the original file](https://github.com/eshaz/icecast-metadata-js/blob/71f6a1fcedb8a44b02035daf56b8020b11e79154/src/icecast-metadata-stats/src/IcecastMetadataStats.js), either by downloading both and comparing locally, or by using an online service like [DiffNow](https://www.diffnow.com/compare-urls).
