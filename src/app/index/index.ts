import { Component, computed, resource, signal } from '@angular/core';
import { RadioBrowserApi, StationSearchType, StationResponse, Station } from 'radio-browser-api';
import { name, version } from '../../../package.json';
//import JSONLocalStorage from './jsonLocalStorage.js';
import ListenbrainzAPI from '../lb_api';

@Component({
  selector: 'app-index',
  imports: [],
  templateUrl: './index.html',
  styleUrl: './index.scss',
})
export class Index {
  private rb = new RadioBrowserApi(name, true);
  private interval?: NodeJS.Timeout;
  private timeout?: NodeJS.Timeout;
  protected metadata?: any = undefined;

  artist = signal<string>('');
  title = signal<string>('');
  mbid = signal<string>('');
  rating = signal<-1 | 0 | 1>(0);
  stationQuery = signal<string>('');
  stationResult = resource({
    params: () => this.stationQuery(),
    loader: ({ params }) => this.searchRadioStations(params),
  });

  // constructor() {
  //   this.parsePins();
  // }

  public async searchRadioStations(query: string) {
    if (!query || query.length < 1) return [];
    let stations = await this.rb.getStationsBy(StationSearchType.byName, query, {
      hideBroken: true,
      limit: 30,
    });
    return stations;
    //   document.getElementById('pin-' + station.id).addEventListener('click', () => {
    //     JSONLocalStorage.pinned_stations = JSONLocalStorage.pinned_stations.concat(station);
    //     this.parsePins();
    //   });
    //   document
    //     .getElementById('station-' + station.id)
    //     .addEventListener('click', () => this.startListening(station));
    // });
  }

  // public async stop() {
  //   clearInterval(this.interval);
  //   if (this.timeout) clearTimeout(this.timeout);
  //   this.timeout = undefined;
  //   pageElements.current_artist.innerText = '';
  //   pageElements.current_title.innerText = '';
  //   pageElements.love.classList.add('disabled');
  //   pageElements.hate.classList.add('disabled');
  //   pageElements.love.firstElementChild.firstElementChild.setAttributeNS(
  //     'http://www.w3.org/1999/xlink',
  //     'href',
  //     heart,
  //   );
  //   pageElements.hate.firstElementChild.firstElementChild.setAttributeNS(
  //     'http://www.w3.org/1999/xlink',
  //     'href',
  //     heartbreak,
  //   );
  //   pageElements.currentImage.src = boombox;
  //   pageElements.now_playing.classList.add('d-none');
  //   pageElements.nothing_playing.classList.remove('d-none');
  //   pageElements.rawPlayingNow.parentElement.classList.add('d-none');
  //   pageElements.rawPlayingNow.innerText = '';
  // }

  public async love() {
    if (!JSONLocalStorage.lb_account) return;
    if (!this.interval) return;
    if (this.rating() != 1) await this.submitFeedback(1);
    else await this.submitFeedback(0);
  }

  public async hate() {
    if (!JSONLocalStorage.lb_account) return;
    if (!this.interval) return;
    if (this.rating() != -1) await this.submitFeedback(-1);
    else await this.submitFeedback(0);
  }

  private async submitFeedback(score: -1 | 0 | 1) {
    let response = await ListenbrainzAPI.submitFeedback(
      this.metadata.recording_mbid,
      score,
      JSONLocalStorage.lb_account.token,
    );
    if (response.status == 'ok') {
      this.rating.set(score);
    }
  }

  // /** utility to check if a function errors out or not on execution. */
  // private throws(func: Function, ...inputs: any[]) {
  //   try {
  //     func(...inputs);
  //     return false;
  //   } catch (e) {
  //     return true;
  //   }
  // }

  // // parse pins
  // private parsePins() {
  //   const pin_container = pageElements.pins;
  //   while (pin_container.hasChildNodes()) pin_container.removeChild(pin_container.firstChild);
  //   if (JSONLocalStorage.pinned_stations.length === 0) pin_container.innerText = 'No pins yet.';
  //   JSONLocalStorage.pinned_stations.forEach((s) => {
  //     pin_container.insertAdjacentHTML(
  //       'beforeend',
  //       /*html*/ `<div class="col mb-3">
  //     <div class="card h-100">
  //       <img src="${s.favicon}" class="card-img-top m-auto" alt="No Logo" style="max-width:fit-content;">
  //       <div class="card-body flex-grow-0">
  //         <h5 class="card-title">${s.name}</h5>
  //       </div>
  //       <div class="card-footer">
  //         <button type="button" id="playpinned-${s.id}" class="btn btn-outline-primary">Start Listening</button>
  //         <button type="button" id="unpin-${s.id}" class="btn btn-outline-secondary">Unpin</button>
  //       </div>
  //     </div>
  //   </div>`,
  //     );
  //     document.getElementById('unpin-' + s.id).addEventListener('click', () => {
  //       JSONLocalStorage.pinned_stations = JSONLocalStorage.pinned_stations.filter(
  //         (st) => st.id !== s.id,
  //       );
  //       parsePins();
  //     });

  //     document
  //       .getElementById('playpinned-' + s.id)
  //       .addEventListener('click', () => this.startListening(s));
  //   });
  // }

  public async startListening(station: Station) {
    if (this.interval) {
      clearInterval(this.interval);
      // pageElements.love.classList.add('disabled');
      // pageElements.hate.classList.add('disabled');
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
            json.title = re ? (re.groups.title ?? 'unknown') : json.nowPlaying;
          }
          if (stream_meta?.nowPlaying !== json.nowPlaying) {
            pageElements.now_playing.classList.remove('d-none');
            pageElements.nothing_playing.classList.add('d-none');
            json.listenedAt = json.listenedAt ?? Math.round(new Date().valueOf() / 1000);
            let lbResponse = await ListenbrainzAPI.submitListens(
              'playing_now',
              [
                {
                  track_metadata: {
                    artist_name: json.artist,
                    track_name: json.title,
                    additional_info: {
                      submission_client: name,
                      submission_client_version: version,
                      music_service_name: station.name,
                      music_service: new URL(station.url).hostname,
                    },
                  },
                },
              ],
              JSONLocalStorage.lb_account.token,
            );
            console.log(lbResponse);
            this.metadata = await ListenbrainzAPI.lookupMetadata(
              json.artist,
              json.title,
              JSONLocalStorage.lb_account.token,
              'release',
            );

            // if timeout not yet triggered, submit old listen now before waiting for the next one.
            if (this.timeout) {
              clearTimeout(this.timeout);
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
                        submission_client: name,
                        submission_client_version: version,
                        music_service_name: station.name,
                        music_service: new URL(station.url).hostname,
                      },
                    },
                  },
                ],
                JSONLocalStorage.lb_account.token,
              );
            }

            // set timeout for submitting a listen after minimum of 4 minutes or half the track duration (if known).
            this.timeout = setTimeout(
              (payload) => {
                this.timeout = null;
                console.log('normal submission', payload);
                ListenbrainzAPI.submitListens(
                  'single',
                  [payload],
                  JSONLocalStorage.lb_account.token,
                );
              },
              Math.min(
                4 * 60 * 1000,
                this.metadata?.metadata?.recording?.length
                  ? this.metadata.metadata.recording.length / 2
                  : Number.POSITIVE_INFINITY,
              ),
              {
                listened_at: json.listenedAt,
                track_metadata: {
                  artist_name: json.artist,
                  track_name: json.title,
                  additional_info: {
                    submission_client: name,
                    submission_client_version: version,
                    music_service_name: station.name,
                    music_service: new URL(station.url).hostname,
                  },
                },
              },
            );

            if (this.metadata.recording_mbid) {
              pageElements.love.classList.remove('disabled');
              pageElements.hate.classList.remove('disabled');
              // set coverart URL
              let coverArtSrc = this.metadata.metadata.release.caa_id
                ? `https://archive.org/download/mbid-${this.metadata.metadata.release.caa_release_mbid}/mbid-${this.metadata.metadata.release.caa_release_mbid}-${this.metadata.metadata.release.caa_id}_thumb250.jpg`
                : boombox;
              pageElements.currentImage.src = coverArtSrc;
              // fetch current loved/hated state
              let feedback = await ListenbrainzAPI.getFeedbackFor(
                JSONLocalStorage.lb_account.userName,
                this.metadata.recording_mbid,
              );
              switch (feedback.feedback[0].score) {
                case -1:
                  // hated
                  pageElements.love.firstElementChild.firstElementChild.setAttributeNS(
                    'http://www.w3.org/1999/xlink',
                    'href',
                    heart,
                  );
                  pageElements.hate.firstElementChild.firstElementChild.setAttributeNS(
                    'http://www.w3.org/1999/xlink',
                    'href',
                    heartbreak_fill,
                  );
                  break;
                case 1:
                  //loved
                  pageElements.love.firstElementChild.firstElementChild.setAttributeNS(
                    'http://www.w3.org/1999/xlink',
                    'href',
                    heart_fill,
                  );
                  pageElements.hate.firstElementChild.firstElementChild.setAttributeNS(
                    'http://www.w3.org/1999/xlink',
                    'href',
                    heartbreak,
                  );
                  break;
                case 0:
                default:
                  // no feedback
                  pageElements.love.firstElementChild.firstElementChild.setAttributeNS(
                    'http://www.w3.org/1999/xlink',
                    'href',
                    heart,
                  );
                  pageElements.hate.firstElementChild.firstElementChild.setAttributeNS(
                    'http://www.w3.org/1999/xlink',
                    'href',
                    heartbreak,
                  );
                  break;
              }
              pageElements.current_artist.innerText = this.metadata.artist_credit_name;
              pageElements.current_title.innerText = this.metadata.recording_name;
            } else {
              pageElements.love.classList.add('disabled');
              pageElements.hate.classList.add('disabled');
              pageElements.currentImage.src = boombox;
              pageElements.love.firstElementChild.firstElementChild.setAttributeNS(
                'http://www.w3.org/1999/xlink',
                'href',
                heart,
              );
              pageElements.hate.firstElementChild.firstElementChild.setAttributeNS(
                'http://www.w3.org/1999/xlink',
                'href',
                heartbreak,
              );
              pageElements.current_artist.innerText = json.artist;
              pageElements.current_title.innerText = json.title;
            }
            stream_meta = json;
            console.log(this.metadata);
          }
        } else {
          stream_meta = undefined;
          pageElements.current_title.innerText = 'unsupported station.';
        }
      }
    }
    loop();
    this.interval = setInterval(loop, JSONLocalStorage.poll_interval * 1000);
  }
}
