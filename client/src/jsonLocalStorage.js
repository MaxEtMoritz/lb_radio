export default class JSONLocalStorage {
  static get lb_account() {
    return this._load('lb_account');
  }
  static set lb_account(v) {
    this._save('lb_account', v);
  }

  static get regex() {
    return this._load('regex') ?? '^(?<artist>.+) - (?<title>.+)$';
  }
  static set regex(v) {
    this._save('regex', v);
  }

  static get poll_interval() {
    return this._load('poll_seconds') ?? 30;
  }
  static set poll_interval(v) {
    this._save('poll_seconds', v);
  }

  static get pinned_stations() {
    return this._load('station_cache') ?? [];
  }
  static set pinned_stations(v) {
    this._save('station_cache', v);
  }

  static _load(k) {
    return JSON.parse(localStorage.getItem(k) ?? 'null');
  }
  static _save(k, v) {
    if (v === undefined || v === null) localStorage.removeItem(k);
    else localStorage.setItem(k, JSON.stringify(v));
  }
}
