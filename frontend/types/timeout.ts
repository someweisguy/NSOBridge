import { OneShot } from "./time";

/**
 * Represent a Timeout or Official Review within a Bout. A Timeout is called to stop the
 * flow of the game. This may be done by any Team with a sufficient number of Timeouts
 * remaining or by the officials for any reason.
 */
export interface Timeout extends OneShot {
  /**
   * The UUID of the Bout associated with this Timeout.
   */
  boutUuid: string;
  /**
   * The unique number identifying this Timeout within its Bout.
   */
  num: number;
  /**
   * The Period number in which this Timeout was called.
   */
  periodNum: number;
  /**
   * The Jam number in which this Timeout was called. The Jam number of a Timeout is
   * always the Jam number of the Jam that has just ended.
   */
  jamNum: number;
  /**
   * The amount of milliseconds that have elapsed on the Period clock when this Timeout
   * was called.
   */
  clockElapsed: number;
  /**
   * The Team number of the Team which called this timeout or null if the calling team
   * has not yet been determined.
   */
  teamNum: number | null;
  /**
   * True if this Timeout was called by the officials.
   */
  teamIsOfficials: boolean;
  /**
   * True if this Timeout is an Official Review.
   */
  isReview: boolean;
  /**
   * Any important details or context about this Timeout. This value is typically used
   * only for Official Reviews.
   */
  details: string;
  /**
   * The result of this Timeout. This value is typically used only for Official Reviews.
   */
  result: string;
  /**
   * True if this Timeout was retained. This value is typically used only for Official
   * Reviews.
   */
  retained: boolean;
}
