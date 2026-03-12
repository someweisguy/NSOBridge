/**
 * The cache key type. When a cached object should be invalidated, the server sends its
 * cache key to all clients via a WebSockets packet. Cache keys are arrays which begin
 * with its database table name, followed by identifiers which can uniquely identify the
 * object.
 */
export type CacheKey = [string, ...unknown[]];

/**
 * The server data that is returned when sending a WebSockets message to the server.
 * This payload can be used to check the server API version as well as to synchronize
 * the client time with the server time. Clock synchronization is important to ensure
 * that all clients are displaying the same time values on similar clocks.
 *
 * For clock sync, Cristian's algorithm is used.
 * See: https://en.wikipedia.org/wiki/Cristian%27s_algorithm
 */
export interface ServerData {
  /**
   * This is the timestamp that is echoed back from the WebSockets packet that the
   * server receives. If no process timestamp is sent by the client, this value is null.
   * To use Cristian's algorithm, it is required to send a process timestamp.
   */
  process: Date | null;
  /**
   * The server timestamp at the time that the WebSocket response packet is sent.
   */
  server: Date;
  /**
   * The server software version in the form of a semantic versioning string (x.y.z).
   */
  version: string;
}

/**
 * Represents the computed sync data between the client and the server.
 */
export interface SyncData {
  /**
   * The time offset between the client and the server in milliseconds. This value may
   * be negative.
   */
  offset: number;
  /**
   * The possible error in the time offset in milliseconds.
   */
  error: number;
}
