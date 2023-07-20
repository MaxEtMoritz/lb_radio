export default class ListenbrainzAPI {
  /**
   * Validates a ListenBrainz Access Token and returns the user information if valid.
   * @param {string} token - Token to validate
   * @returns ListenBrainz API response as JSON object
   */
  static async validateToken(token) {
    let res = await fetch('https://api.listenbrainz.org/1/validate-token', {
      headers: {
        Authorization: `Token ${token}`
      }
    });
    if (!res.ok) {
      throw new ListenbrainzError((await res.json()).message);
    }
    return res.json();
  }

  /**
   * Submits Feedback (love / hate) to Listenbrainz for a recording.
   * @param {string} mbid MusicBrainz ID of the recording
   * @param {-1|0|1} score Feedback Score:
   *    | score | meaning |
   *    | ----- | ------- |
   *    | -1    | hate    |
   *    | 0     | neutral |
   *    | 1     | love    |
   * @param {string} token ListenBrainz Auth Token
   * @returns Response of the ListenBrainz API as JSON object.
   */
  static async submitFeedback(mbid, score, token) {
    let response = await fetch('https://api.listenbrainz.org/1/feedback/recording-feedback', {
      method: 'POST',
      headers: {
        Authorization: `Token ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        recording_mbid: mbid,
        score
      })
    });
    if (!response.ok) {
      throw new ListenbrainzError(await response.json());
    }
    return response.json();
  }

  /**
   * Looks up the feedback a specific user has given for a set of MBIDs.
   * @param {string} user - name of the user
   * @param  {...string} mbids - mbids to check
   * @returns Reponse of ListenBrainz server
   */
  static async getFeedbackFor(user, ...mbids) {
    let response = await fetch(`https://api.listenbrainz.org/1/feedback/user/${user}/get-feedback-for-recordings?recording_mbids=${mbids.join(',')}`);
    if (!response.ok) {
      throw new ListenbrainzError(await response.json());
    }
    return response.json();
  }

  /**
   * Submits Listens and playing now notifications to ListenBrainz.
   * @param {'single'|'playing_now'|'import'} listenType - Type of Listen to submit
   * @param {Array<any>} payload - Submission payload
   * @param {string} token - ListenBrainz Auth Token
   */
  static async submitListens(listenType, payload, token) {
    let lbResponse = await fetch('https://api.listenbrainz.org/1/submit-listens', {
      method: 'POST',
      body: JSON.stringify({
        listen_type: listenType,
        payload
      }),
      headers: {
        Authorization: `Token ${token}`
      }
    });
    if (!lbResponse.ok) {
      throw new ListenbrainzError(await lbResponse.json());
    }
    return lbResponse.json();
  }

  /**
   * Looks up metadata for a recording by title and artist.
   * @param {string} artist - name of the recording artist(s)
   * @param {string} title - name of the recording
   * @param {Array<'artist'|'tag'|'release'>} additionalMeta - additional metadata to request
   * @returns Response of the ListenBrainz API
   */
  static async lookupMetadata(artist, title, ...additionalMeta) {
    let response = await fetch(
      `https://api.listenbrainz.org/1/metadata/lookup/?artist_name=${encodeURIComponent(artist)}&recording_name=${encodeURIComponent(title)}&metadata=${
        additionalMeta.length > 0
      }&inc=${additionalMeta.join('%20')}`
    );
    if (!response.ok) {
      throw new ListenbrainzError(await response.json());
    }
    return response.json();
  }
}

export class ListenbrainzError extends Error {}
