/**
 * @typedef {object} options
 * @property {Array} [sources] List of sources to automatically query ["icy", "ogg", "icestats", "stats", "sevenhtml", "nextsongs"]
 * @property {number} [interval] Time in seconds to wait between automatically queries
 * @property {URL} [icestatsEndpoint] Endpoint for the `status-json.xsl` source
 * @property {URL} [statsEndpoint] Endpoint for the `stats` source
 * @property {URL} [nextsongsEndpoint] Endpoint for the `nextsongs` source
 * @property {URL} [sevenhtmlEndpoint] Endpoint for the `7.html` source
 * @property {number} [icyMetaInt] Manually sets the ICY metadata interval
 * @property {string} [icyCharacterEncoding] Character encoding to use for ICY metadata (defaults to "utf-8")
 * @property {number} [icyDetectionTimeout] Time in milliseconds to search for ICY metadata
 * @property {string} [streamonkeySessionId] StreaMonkey Streaming Session ID
 * @property {string} [historyEtag] last ETag header
 * @property {Function} [onStats] Called when the automatic query completes
 * @property {Function} [onStatsFetch] Called when the automatic query begins
 */
export default class IcecastMetadataStats {
    static xml2Json(xml: any): any;
    /**
     * @constructor
     * @param {URL} endpoint Stream endpoint
     * @param {options} [options] Options object
     */
    constructor(endpoint: URL, options?: options);
    /**
     * @returns The current state ["stopped", "running", "fetching"]
     */
    get state(): any;
    /**
     * @returns The generated `status-json.xsl` endpoint
     */
    get icestatsEndpoint(): any;
    /**
     * @returns The generated `stats` endpoint
     */
    get statsEndpoint(): any;
    /**
     * @returns The generated `streamonkey` endpoint
     */
    get streamonkeyEndpoint(): any;
    /**
     * @returns The generated `history` endpoint
     */
    get historyEndpoint(): any;
    /**
     * @returns The generated `history` etag
     */
    get historyEtag(): any;
    /**
     * @returns The generated `nextsongs` endpoint
     */
    get nextsongsEndpoint(): any;
    /**
     * @returns The generated `7.html` endpoint
     */
    get sevenhtmlEndpoint(): any;
    /**
     * @description Starts automatically fetching stats
     */
    start(): void;
    /**
     * @description Stops automatically fetching stats and cancels any inprogress stats
     */
    stop(): void;
    /**
     * @typedef fetchResult
     * @property {any} [icestats] Results of the `icestats` source, if successful and requested.
     * @property {any} [sevenhtml] Results of the `sevenhtml` source, if successful and requested.
     * @property {any} [stats] Results of the `stats` source, if successful and requested.
     * @property {any} [nextsongs] Results of the `nextsongs` source, if successful and requested.
     * @property {any} [icy] Results of the `icy` source, if successful and requested.
     * @property {any} [ogg] Results of the `ogg` source, if successful and requested.
     * @property {any} [streamonkey] Results of the `streamonkey` source, if successful and requested.
     * @property {any} [history] Results of the `history` source, if successful and requested.
     */
    /**
     * @description Manually fetches stats from the sources passed in to the `options.sources` parameter
     * @async
     * @returns {Promise<fetchResult>} Object containing the stats from the sources
     */
    fetch(): Promise<{
        /**
         * Results of the `icestats` source, if successful and requested.
         */
        icestats?: any;
        /**
         * Results of the `sevenhtml` source, if successful and requested.
         */
        sevenhtml?: any;
        /**
         * Results of the `stats` source, if successful and requested.
         */
        stats?: any;
        /**
         * Results of the `nextsongs` source, if successful and requested.
         */
        nextsongs?: any;
        /**
         * Results of the `icy` source, if successful and requested.
         */
        icy?: any;
        /**
         * Results of the `ogg` source, if successful and requested.
         */
        ogg?: any;
        /**
         * Results of the `streamonkey` source, if successful and requested.
         */
        streamonkey?: any;
        /**
         * Results of the `history` source, if successful and requested.
         */
        history?: any;
    }>;
    /**
     * @description Fetches the data from the `/status-json.xsl` endpoint
     * @async
     * @returns {Promise<object>} Object containing results of `/status-json.xsl`
     */
    getIcestats(): Promise<object>;
    /**
     * @description Fetches the data from the `/7.html` endpoint
     * @async
     * @returns {Promise<object>} Object containing results of `/7.html`
     */
    getSevenhtml(): Promise<object>;
    /**
     * @description Fetches the data from the `/stats` endpoint
     * @async
     * @returns {Promise<object>} Object containing results of `/stats`
     */
    getStats(): Promise<object>;
    /**
     * @description Fetches the data from the `/nextsongs` endpoint
     * @async
     * @returns {Promise<object>} Object containing results of `/nextsongs`
     */
    getNextsongs(): Promise<object>;
    getStreamonkey(): Promise<{
        streamonkey: void | Response;
    }>;
    getHistory(): Promise<{
        history: void | Response;
    }>;
    /**
     * @description Fetches the first ICY metadata update from the stream
     * @async
     * @returns {Promise<object>} Object containing ICY metadata
     */
    getIcyMetadata(): Promise<object>;
    /**
     * @description Fetches the first Ogg metadata update from the stream
     * @async
     * @returns {Promise<object>} Object containing Ogg metadata
     */
    getOggMetadata(): Promise<object>;
    [getStreamMetadata]({ status, endpoint, controller, headers, metadataType }: {
        status: any;
        endpoint: any;
        controller: any;
        headers: any;
        metadataType: any;
    }): Promise<{
        [metadataType]: void | Response;
    }>;
    [fetchStats]({ status, endpoint, controller, mapper, headers }: {
        status: any;
        endpoint: any;
        controller: any;
        mapper: any;
        headers?: {};
    }): Promise<void | Response>;
}
export type options = {
    /**
     * List of sources to automatically query ["icy", "ogg", "icestats", "stats", "sevenhtml", "nextsongs"]
     */
    sources?: any[];
    /**
     * Time in seconds to wait between automatically queries
     */
    interval?: number;
    /**
     * Endpoint for the `status-json.xsl` source
     */
    icestatsEndpoint?: URL;
    /**
     * Endpoint for the `stats` source
     */
    statsEndpoint?: URL;
    /**
     * Endpoint for the `nextsongs` source
     */
    nextsongsEndpoint?: URL;
    /**
     * Endpoint for the `7.html` source
     */
    sevenhtmlEndpoint?: URL;
    /**
     * Manually sets the ICY metadata interval
     */
    icyMetaInt?: number;
    /**
     * Character encoding to use for ICY metadata (defaults to "utf-8")
     */
    icyCharacterEncoding?: string;
    /**
     * Time in milliseconds to search for ICY metadata
     */
    icyDetectionTimeout?: number;
    /**
     * StreaMonkey Streaming Session ID
     */
    streamonkeySessionId?: string;
    /**
     * last ETag header
     */
    historyEtag?: string;
    /**
     * Called when the automatic query completes
     */
    onStats?: Function;
    /**
     * Called when the automatic query begins
     */
    onStatsFetch?: Function;
};
declare const getStreamMetadata: unique symbol;
declare const fetchStats: unique symbol;
export {};
