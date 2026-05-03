import { CacheKey } from "./query";
import { OneShot } from "./abstract";

/**
 * A type which represents all of the possible reason a Jam may be stopped.
 */
export type StopReasonString = "called" | "elapsed" | "injury" | "other";

/**
 * A unit of gameplay within a Bout. These are typically two-minute rounds of action
 * during the run of the Bout.
 */
export class Jam implements OneShot {
  /**
   * The UUID of the Bout associated with this Jam.
   */
  boutUuid: string;
  /**
   * The Period number of this Jam.
   */
  period: number;
  /**
   * The Jam number of this Jam.
   */
  num: number;
  startTimestamp: string | null;
  stopTimestamp: string | null;
  /**
   * The reason that this Jam was stopped or null if it hasn't been stopped.
   */
  stopReason: StopReasonString | null;
  /**
   * The TeamJams associated with this Jam.
   */
  teamJams: TeamJam[];

  /**
   * Generate a cache key for the desired Jam.
   *
   * @param boutUuid the UUID of the Bout associated with the desired Jam.
   * @param periodNum the Period number of the desired Jam.
   * @param jamNum the Jam number of the desired Jam.
   * @returns a cache key for the desired Jam.
   */
  static generateKey(
    boutUuid?: string,
    periodNum?: number,
    jamNum?: number,
  ): CacheKey {
    return ["jams", boutUuid, periodNum, jamNum];
  }

  // /**
  //  * Determine if this Jam has started.
  //  *
  //  * @returns true if this Jam has started.
  //  */
  // hasStarted(): boolean {
  //   return this.startTimestamp != null;
  // }

  // /**
  //  * Determine if this Jam is currently running.
  //  *
  //  * @returns true if this Jam is currently running.
  //  */
  // isRunning(): boolean {
  //   return this.hasStarted() && this.stopTimestamp == null;
  // }
}

/**
 * Represent a TeamJam within a Jam. A TeamJam is data which pertains to a particular
 * team within a Jam. Such data may include the Jammer's trips or lineup data.
 */
export class TeamJam {
  /**
   * The unique number of the Team with which this TeamJam is associated.
   */
  teamNum: number;
  /**
   * An array of Jammer Trip events that have occurred during this Jam.
   */
  events: TripEvent[];

  // /**
  //  * Get the number of passes that this TeamJam's jammer has completed.
  //  *
  //  * @returns the number of passes that the Jammer has completed.
  //  */
  // getNumTrips(): number {
  //   return this.events.filter((tripEvent) => tripEvent.passes != null).length;
  // }
}

/**
 * Represent a Trip event object. A Trip event is any event which may occur during a
 * Trip. When Trip passes are non-null, a trip is considered to have been completed. Any
 * TripEvent which has null passes is an event which is considered to have occurred
 * during the previous Trip.
 */
export interface TripEvent {
  /**
   * The timestamp at which this event occurred.
   */
  timestamp: string;
  /**
   * True if the Jammer was awarded Lead.
   */
  lead: boolean;
  /**
   * True if the Jammer lost lead Jammer eligibility;
   */
  lost: boolean;
  /**
   * The number of passes that this Jammer was awarded during the Trip. Setting this
   * value to a non-null number ends the current Trip and begins the next.
   */
  passes: number | null;
  /**
   * True if the Jammer successfully completed a star pass.
   */
  starPass: boolean;
}
