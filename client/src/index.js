import { RadioBrowserApi, StationSearchType } from 'radio-browser-api';
import pkg from '../../package.json';
import bs, { Modal } from 'bootstrap';
import JSONLocalStorage from './jsonLocalStorage';
import * as pageElements from './pageElements';
import icons from 'bootstrap-icons/bootstrap-icons.svg';
const heart = icons + '#heart';
const heartbreak = icons + '#heartbreak';
const heart_fill = icons + '#heart-fill';
const heartbreak_fill = icons + '#heartbreak-fill';
import boombox from 'bootstrap-icons/icons/boombox.svg';
import ListenbrainzAPI from './lb_api';

const rb = new RadioBrowserApi(pkg.name, true);
let interval;
let timeout;

window.searchRadioStations = async () => {
  let stations = await rb.getStationsBy(StationSearchType.byName, pageElements.stationName.value, { hideBroken: true, limit: 30 });
  /** @type {HTMLTableElement} */
  let table = pageElements.results;
  while (table.tBodies[0].childElementCount > 0) {
    table.tBodies[0].removeChild(table.tBodies[0].firstElementChild);
  }
  stations.forEach(async station => {
    console.log(station);
    table.tBodies[0].insertAdjacentHTML(
      'beforeend',
      /*html*/ `<tr>
        <td><img src="${station.favicon}" style="max-height: 50px;"></td>
        <td>${station.name}</td>
        <td>${station.country}</td>
        <td><a href="${station.homepage}">Visit</a></td>
        <td>
          <div class="btn-group">
            <button type="button" id="station-${station.id}" class="btn btn-outline-primary">Start Listening</button>
            <button type="button" id="pin-${station.id}" class="btn btn-outline-secondary">Pin Station</button>
          </div>
        </td>
      </tr>`
    );
    document.getElementById('pin-' + station.id).addEventListener('click', () => {
      JSONLocalStorage.pinned_stations = JSONLocalStorage.pinned_stations.concat(station);
      parsePins();
    });
    document.getElementById('station-' + station.id).addEventListener('click', () => startListening(station));
  });
};

pageElements.stop.addEventListener('click', async () => {
  clearInterval(interval);
  if (timeout) clearTimeout(timeout);
  timeout = null;
  pageElements.current_artist.innerText = '';
  pageElements.current_title.innerText = '';
  pageElements.love.classList.add('disabled');
  pageElements.hate.classList.add('disabled');
  pageElements.love.firstElementChild.firstElementChild.setAttributeNS('http://www.w3.org/1999/xlink', 'href', heart);
  pageElements.hate.firstElementChild.firstElementChild.setAttributeNS('http://www.w3.org/1999/xlink', 'href', heartbreak);
  pageElements.currentImage.src = boombox;
  pageElements.now_playing.classList.add('d-none');
  pageElements.nothing_playing.classList.remove('d-none');
  pageElements.rawPlayingNow.parentElement.classList.add('d-none');
  pageElements.rawPlayingNow.innerText = '';
});

window.love = async () => {
  if (!JSONLocalStorage.lb_account) return;
  if (!interval) return;
  console.log(pageElements.love.firstElementChild.firstElementChild.getAttributeNS('http://www.w3.org/1999/xlink', 'href'));
  if (pageElements.love.firstElementChild.firstElementChild.getAttributeNS('http://www.w3.org/1999/xlink', 'href') == heart) await submitFeedback(1);
  else await submitFeedback(0);
};

window.hate = async () => {
  if (!JSONLocalStorage.lb_account) return;
  if (!interval) return;
  if (pageElements.hate.firstElementChild.firstElementChild.getAttributeNS('http://www.w3.org/1999/xlink', 'href') == heartbreak) await submitFeedback(-1);
  else await submitFeedback(0);
};

async function submitFeedback(score) {
  let response = await ListenbrainzAPI.submitFeedback(metadata.recording_mbid, score, JSONLocalStorage.lb_account.token);
  if (response.status == 'ok') {
    switch (score) {
      case 1:
        //love
        pageElements.love.firstElementChild.firstElementChild.setAttributeNS('http://www.w3.org/1999/xlink', 'href', heart_fill);
        pageElements.hate.firstElementChild.firstElementChild.setAttributeNS('http://www.w3.org/1999/xlink', 'href', heartbreak);
        break;
      case -1:
        // hate
        pageElements.love.firstElementChild.firstElementChild.setAttributeNS('http://www.w3.org/1999/xlink', 'href', heart);
        pageElements.hate.firstElementChild.firstElementChild.setAttributeNS('http://www.w3.org/1999/xlink', 'href', heartbreak_fill);
        break;
      case 0:
      default:
        // feedback reset
        pageElements.love.firstElementChild.firstElementChild.setAttributeNS('http://www.w3.org/1999/xlink', 'href', heart);
        pageElements.hate.firstElementChild.firstElementChild.setAttributeNS('http://www.w3.org/1999/xlink', 'href', heartbreak);
        break;
    }
  }
}

pageElements.modal.addEventListener('show.bs.modal', e => {
  console.log('show');

  pageElements.lb_token.value = JSONLocalStorage.lb_account?.token ?? '';
  pageElements.lb_token.setCustomValidity('');

  pageElements.regex.value = JSONLocalStorage.regex;
  pageElements.regex.setCustomValidity('');

  pageElements.poll_interval.value = JSONLocalStorage.poll_interval;
  pageElements.slider_value.innerText = pageElements.poll_interval.valueAsNumber;

  pageElements.regex101.href = `https://regex101.com/?flavor=javascript&regex=${encodeURIComponent(pageElements.regex.value)}&flags=`;

  pageElements.settings_form.classList.remove('was-validated');
});

window.saveSettings = async function () {
  let currentUserInfo = JSONLocalStorage.lb_account ?? {};
  let tokenInput = pageElements.lb_token;
  let ls_update = {};
  if (currentUserInfo.token != tokenInput.value) {
    let res = await ListenbrainzAPI.validateToken(tokenInput.value);
    if (res.valid) {
      tokenInput.setCustomValidity('');
      ls_update['lb_account'] = { token: tokenInput.value, userName: res.user_name };
    } else {
      tokenInput.setCustomValidity('the token is invalid.');
    }
  }

  let currentRegex = JSONLocalStorage.regex;
  let regexInput = pageElements.regex;
  if (currentRegex != regexInput.value) {
    let t_re = /\(\?<title>.*?\)/g;
    let a_re = /\(\?<artist>.*?\)/g;
    if (!throws(v => new RegExp(v), regexInput.value) && t_re.exec(regexInput.value) && a_re.exec(regexInput.value)) {
      regexInput.setCustomValidity('');
      ls_update['regex'] = regexInput.value;
    } else if (throws(v => new RegExp(v), regexInput.value)) {
      try {
        new RegExp(regexInput.value);
      } catch (e) {
        regexInput.setCustomValidity(e.message);
      }
    } else {
      regexInput.setCustomValidity('Input must contain the named capturing groups "artist" and "title".');
    }
  }

  let currentPollInterval = JSONLocalStorage.poll_interval;
  if (currentPollInterval != pageElements.poll_interval.valueAsNumber) {
    ls_update['poll_interval'] = pageElements.poll_interval.valueAsNumber;
  }

  pageElements.settings_form.classList.add('was-validated');
  if (pageElements.settings_form.reportValidity()) {
    for (const [k, v] of Object.entries(ls_update)) {
      JSONLocalStorage[k] = v;
    }
    Modal.getOrCreateInstance('#modal').hide();
  }
};

/** utility to check if a function errors out or not on execution. */
function throws(func, ...inputs) {
  try {
    func(...inputs);
    return false;
  } catch (e) {
    return true;
  }
}

// parse pins
function parsePins() {
  const pin_container = pageElements.pins;
  while (pin_container.hasChildNodes()) pin_container.removeChild(pin_container.firstChild);
  if (JSONLocalStorage.pinned_stations.length === 0) pin_container.innerText = 'No pins yet.';
  JSONLocalStorage.pinned_stations.forEach(s => {
    pin_container.insertAdjacentHTML(
      'beforeend',
      /*html*/ `<div class="col mb-3">
    <div class="card h-100">
      <img src="${s.favicon}" class="card-img-top m-auto" alt="No Logo" style="max-width:fit-content;">
      <div class="card-body flex-grow-0">
        <h5 class="card-title">${s.name}</h5>
      </div>
      <div class="card-footer">
        <button type="button" id="playpinned-${s.id}" class="btn btn-outline-primary">Start Listening</button>
        <button type="button" id="unpin-${s.id}" class="btn btn-outline-secondary">Unpin</button>
      </div>
    </div>
  </div>`
    );
    document.getElementById('unpin-' + s.id).addEventListener('click', () => {
      JSONLocalStorage.pinned_stations = JSONLocalStorage.pinned_stations.filter(st => st.id !== s.id);
      parsePins();
    });

    document.getElementById('playpinned-' + s.id).addEventListener('click', () => startListening(s));
  });
}
parsePins();

let metadata = null;

async function startListening(station) {
  if (interval) {
    clearInterval(interval);
    pageElements.love.classList.add('disabled');
    pageElements.hate.classList.add('disabled');
  }
  if (!JSONLocalStorage.lb_account) return;
  let implementation = null;
  let stream_meta = null;
  async function loop() {
    let requrl = '/nowplaying?url=' + encodeURIComponent(station.urlResolved);
    if (implementation) {
      requrl += '&implementation=' + implementation;
    }
    let res = await fetch(requrl);
    if (res.ok) {
      let json = await res.json();
      implementation = json.implementation;
      if (implementation) {
        if (!json.artist || !json.title) {
          let re = new RegExp(JSONLocalStorage.regex).exec(json.nowPlaying);
          if (!re || !re.groups.artist || !re.groups.title) {
            console.log('skip', json.nowPlaying);
            pageElements.rawPlayingNow.parentElement.classList.remove('d-none');
            pageElements.rawPlayingNow.innerText = json.nowPlaying;
            // TODO: show info containing nowPlaying string and "You may need to adapt the RegEx in settings".
            return;
          } else {
            pageElements.rawPlayingNow.parentElement.classList.add('d-none');
            pageElements.rawPlayingNow.innerText = '';
          }
          json.artist = re?.groups.artist ?? 'unknown';
          json.title = re ? re.groups.title ?? 'unknown' : json.nowPlaying;
        }
        if (stream_meta?.nowPlaying !== json.nowPlaying) {
          pageElements.now_playing.classList.remove('d-none');
          pageElements.nothing_playing.classList.add('d-none');
          json.listenedAt = json.listenedAt??Math.round(new Date().valueOf() / 1000)
          let lbResponse = await ListenbrainzAPI.submitListens(
            'playing_now',
            [
              {
                track_metadata: {
                  artist_name: json.artist,
                  track_name: json.title,
                  additional_info: {
                    submission_client: pkg.name,
                    submission_client_version: pkg.version,
                    music_service_name: station.name,
                    music_service: new URL(station.url).hostname
                  }
                }
              }
            ],
            JSONLocalStorage.lb_account.token
          );
          console.log(lbResponse);
          metadata = await ListenbrainzAPI.lookupMetadata(json.artist, json.title, 'release');

          // if timeout not yet triggered, submit old listen now before waiting for the next one.
          if (timeout) {
            clearTimeout(timeout);
            console.log('late submission');
            await ListenbrainzAPI.submitListens(
              'single',
              [
                {
                  listened_at: stream_meta.listenedAt,
                  track_metadata: {
                    artist_name: stream_meta.artist,
                    track_name: stream_meta.title,
                    additional_info: {
                      submission_client: pkg.name,
                      submission_client_version: pkg.version,
                      music_service_name: station.name,
                      music_service: new URL(station.url).hostname
                    }
                  }
                }
              ],
              JSONLocalStorage.lb_account.token
            );
          }

          // set timeout for submitting a listen after minimum of 4 minutes or half the track duration (if known).
          timeout = setTimeout(
            payload => {
              timeout = null;
              console.log('normal submission', payload);
              ListenbrainzAPI.submitListens('single', [payload], JSONLocalStorage.lb_account.token);
            },
            Math.min(4 * 60 * 1000, metadata?.metadata?.recording?.length/2 ?? Number.POSITIVE_INFINITY),
            {
              listened_at: json.listenedAt,
              track_metadata: {
                artist_name: json.artist,
                track_name: json.title,
                additional_info: {
                  submission_client: pkg.name,
                  submission_client_version: pkg.version,
                  music_service_name: station.name,
                  music_service: new URL(station.url).hostname
                }
              }
            }
          );

          if (metadata.recording_mbid) {
            pageElements.love.classList.remove('disabled');
            pageElements.hate.classList.remove('disabled');
            // set coverart URL
            let coverArtSrc = metadata.metadata.release.caa_id
              ? `https://archive.org/download/mbid-${metadata.metadata.release.caa_release_mbid}/mbid-${metadata.metadata.release.caa_release_mbid}-${metadata.metadata.release.caa_id}_thumb250.jpg`
              : boombox;
            pageElements.currentImage.src = coverArtSrc;
            // fetch current loved/hated state
            let feedback = await ListenbrainzAPI.getFeedbackFor(JSONLocalStorage.lb_account.userName, metadata.recording_mbid);
            switch (feedback.feedback[0].score) {
              case -1:
                // hated
                pageElements.love.firstElementChild.firstElementChild.setAttributeNS('http://www.w3.org/1999/xlink', 'href', heart);
                pageElements.hate.firstElementChild.firstElementChild.setAttributeNS('http://www.w3.org/1999/xlink', 'href', heartbreak_fill);
                break;
              case 1:
                //loved
                pageElements.love.firstElementChild.firstElementChild.setAttributeNS('http://www.w3.org/1999/xlink', 'href', heart_fill);
                pageElements.hate.firstElementChild.firstElementChild.setAttributeNS('http://www.w3.org/1999/xlink', 'href', heartbreak);
                break;
              case 0:
              default:
                // no feedback
                pageElements.love.firstElementChild.firstElementChild.setAttributeNS('http://www.w3.org/1999/xlink', 'href', heart);
                pageElements.hate.firstElementChild.firstElementChild.setAttributeNS('http://www.w3.org/1999/xlink', 'href', heartbreak);
                break;
            }
            pageElements.current_artist.innerText = metadata.artist_credit_name;
            pageElements.current_title.innerText = metadata.recording_name;
          } else {
            pageElements.love.classList.add('disabled');
            pageElements.hate.classList.add('disabled');
            pageElements.currentImage.src = boombox;
            pageElements.love.firstElementChild.firstElementChild.setAttributeNS('http://www.w3.org/1999/xlink', 'href', heart);
            pageElements.hate.firstElementChild.firstElementChild.setAttributeNS('http://www.w3.org/1999/xlink', 'href', heartbreak);
            pageElements.current_artist.innerText = json.artist;
            pageElements.current_title.innerText = json.title;
          }
          stream_meta = json;
          console.log(metadata);
        }
      } else {
        stream_meta = undefined;
        pageElements.current_title.innerText = 'unsupported station.';
      }
    }
  }
  loop();
  interval = setInterval(loop, JSONLocalStorage.poll_interval * 1000);
}
