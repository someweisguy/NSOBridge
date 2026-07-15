/**
 * An object that contains various configuration values that determine how the Bout is
 * played. This is used to support multiple styles of Roller Derby play without
 * adjusting the codebase in a major way. Each Bout may only support one Ruleset.
 */
export interface Ruleset {
  /**
   * The name of the Ruleset.
   */
  name: string;
  /**
   * The duration of the Jam in milliseconds.
   */
  jamDuration: number;
  /**
   * The duration of the Lineup in milliseconds.
   */
  lineupDuration: number;
  /**
   * The maximum number of points that a Jammer may earn per trip through the pack.
   */
  pointsPerTrip: number;
  /**
   * The number of Timeouts that each Team may have at any given time.
   */
  numTimeouts: number;
  /**
   * The number of Official Reviews that each Team may have at any given time.
   */
  numReviews: number;
}
