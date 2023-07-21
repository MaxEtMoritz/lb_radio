const express = require('express');
const { IcecastMetadataStats } = require('./IcecastMetadataStats.js');
const app = express();
const path = require('path');

app.use(express.static(path.resolve(__dirname, '../client/dist')));

const SUPPORTED_SERVERS = Object.freeze({
  ICECAST: Symbol('ICECAST'),
  SHOUTCAST: Symbol('SHOUTCAST'),
  SHOUTCAST_LEG: Symbol('SHOUTCAST_LEG'),
  STREAM_ICY: Symbol('STREAM_ICY'),
  STREAM_OGG: Symbol('STREAM_OGG'),
  STREAMONKEY: Symbol('STREAMONKEY')
});

const IMPL2SOURCE = Object.freeze({
  ICECAST: 'icestats',
  SHOUTCAST: 'stats',
  SHOUTCAST_LEG: 'sevenhtml',
  STREAM_ICY: 'icy',
  STREAM_OGG: 'ogg',
  STREAMONKEY: 'history'
});

app.get('/nowplaying', async (req, res) => {
  res.setTimeout(10000, () => res.status(500).send());
  if (!req.query.url) {
    res.status(400).send('missing param "url"');
    return;
  }
  let implementation = req.query['implementation'] ?? Object.getOwnPropertyNames(SUPPORTED_SERVERS);
  if (!Array.isArray(implementation)) implementation = [implementation];
  console.log(implementation);
  let implResults = [];
  let url = new URL(req.query.url);
  const statsFetcher = new IcecastMetadataStats(url.toString(), {
    sources: implementation.map(imp => IMPL2SOURCE[imp]),
    historyEtag: implementation.includes(SUPPORTED_SERVERS.STREAMONKEY.description) ? req.headers['if-none-match'] : null
  });
  let stats = await statsFetcher.fetch();
  if (stats.stats) {
    implResults.push({
      implementation: SUPPORTED_SERVERS.SHOUTCAST.description,
      nowPlaying: stats.stats.SONGTITLE
    });
  }
  if (stats.sevenhtml) {
    implResults.push({
      implementation: SUPPORTED_SERVERS.SHOUTCAST_LEG.description,
      nowPlaying: stats.sevenhtml[0].StreamTitle
    });
  }
  if (stats.icestats) {
    if (!Array.isArray(stats.icestats.source)) {
      stats.icestats.source = [stats.icestats.source];
    }
    //console.log(stats.icestats.source)
    let correctSource = stats.icestats.source.find(s => new URL(s.listenurl).pathname == url.pathname);
    if (correctSource && correctSource.title) {
      let result = {
        implementation: SUPPORTED_SERVERS.ICECAST.description,
        nowPlaying: correctSource.title
      };
      if (correctSource.artist) {
        result.artist = correctSource.artist;
        result.title = correctSource.title;
        result.nowPlaying = `${correctSource.artist} - ${correctSource.title}`;
      }
      implResults.push();
    }
  }
  if (statsFetcher.historyEtag) {
    res.header('etag', statsFetcher.historyEtag);
    if (req.headers['if-none-match'] == statsFetcher.historyEtag) {
      console.log('not modified');
      return res.status(304).send();
    }
  }
  if (stats.history) {
    implResults.push({
      implementation: SUPPORTED_SERVERS.STREAMONKEY.description,
      nowPlaying: stats.history[0].MetaTitle,
      artist: stats.history[0].MetaArtist,
      title: stats.history[0].MetaSong,
      listenedAt: Math.round(new Date(stats.history[0].InsertDate) / 1000)
    });
  }
  if (stats.icy) {
    implResults.push({
      implementation: SUPPORTED_SERVERS.STREAM_ICY.description,
      nowPlaying: stats.icy.StreamTitle
    });
  }
  if (stats.ogg && stats.ogg.TITLE && stats.ogg.ARTIST) {
    implResults.push({
      implementation: SUPPORTED_SERVERS.STREAM_OGG.description,
      artist: stats.ogg.ARTIST,
      title: stats.ogg.TITLE,
      nowPlaying: `${stats.ogg.ARTIST} - ${stats.ogg.TITLE}`
    });
  }

  let implResult = implResults[0];

  if (
    implResults.some(i =>
      [SUPPORTED_SERVERS.SHOUTCAST.description, SUPPORTED_SERVERS.SHOUTCAST_LEG.description, SUPPORTED_SERVERS.ICECAST.description, SUPPORTED_SERVERS.STREAMONKEY.description].includes(
        i.implementation
      )
    )
  ) {
    // prefer stats endpoints over stream metadata
    implResult = implResults
      .filter(i =>
        [SUPPORTED_SERVERS.SHOUTCAST.description, SUPPORTED_SERVERS.SHOUTCAST_LEG.description, SUPPORTED_SERVERS.ICECAST.description, SUPPORTED_SERVERS.STREAMONKEY.description].includes(
          i.implementation
        )
      )
      .sort(i => (i.implementation == SUPPORTED_SERVERS.SHOUTCAST.description ? 1 : 0))[0];
  }
  console.log(implResults, '=>', implResult);
  res.send(implResult);
});

require('http')
  .createServer(app)
  .listen(80, undefined, undefined, () => {
    console.log('🚀');
  });
