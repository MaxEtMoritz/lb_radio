export default class ListenbrainzAPI {
  /**
   * Validates a ListenBrainz Access Token and returns the user information if valid.
   * @param token - Token to validate
   * @returns ListenBrainz API response as JSON object
   */
  static async validateToken(token: string) {
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
   * @param mbid MusicBrainz ID of the recording
   * @param score Feedback Score:
   *    | score | meaning |
   *    | ----- | ------- |
   *    | -1    | hate    |
   *    | 0     | neutral |
   *    | 1     | love    |
   * @param token ListenBrainz Auth Token
   * @returns Response of the ListenBrainz API as JSON object.
   */
  static async submitFeedback(mbid: string, score: -1|0|1, token: string) {
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
   * @param user - name of the user
   * @param mbids - mbids to check
   * @returns Reponse of ListenBrainz server
   */
  static async getFeedbackFor(user: string, ...mbids: string[]) {
    let response = await fetch(`https://api.listenbrainz.org/1/feedback/user/${user}/get-feedback-for-recordings?recording_mbids=${mbids.join(',')}`);
    if (!response.ok) {
      throw new ListenbrainzError(await response.json());
    }
    return response.json();
  }

  /**
   * Submits Listens and playing now notifications to ListenBrainz.
   * @param listenType - Type of Listen to submit
   * @param payload - Submission payload
   * @param token - ListenBrainz Auth Token
   */
  static async submitListens(listenType: 'single'|'playing_now'|'import', payload: any[], token: string) {
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
   * @param artist - name of the recording artist(s)
   * @param title - name of the recording
   * @param additionalMeta - additional metadata to request
   * @param token - ListenBrainz Auth Token
   * @returns Response of the ListenBrainz API
   */
  static async lookupMetadata(artist: string, title: string, token: string, ...additionalMeta:Array<'artist'|'tag'|'release'>) {
    let response = await fetch(
      `https://api.listenbrainz.org/1/metadata/lookup/?artist_name=${encodeURIComponent(artist)}&recording_name=${encodeURIComponent(title)}&metadata=${
        additionalMeta.length > 0
      }&inc=${additionalMeta.join('%20')}`,
      {
        headers: {
          Authorization: `Token ${token}`
        }
      }
    );
    if (!response.ok) {
      throw new ListenbrainzError(await response.json());
    }
    return response.json();
  }
}

export class ListenbrainzError extends Error {}
