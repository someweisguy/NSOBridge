import { localAPI } from "@/lib/requests";
import { CacheKey } from "@/types/ws";

/**
 * A type which represents all of the possible reason a Jam may be stopped.
 */
export type StopReasonString = "called" | "elapsed" | "injury" | "other";

/**
 * A unit of gameplay within a Bout. These are typically two-minute rounds of action
 * during the run of the Bout.
 */
export class Jam {
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
  /**
   * The timestamp at which this Jam started or null if it hasn't been started.
   */
  startTimestamp: Date | null;
  /**
   * The timestamp at which this Jam was stopped or null if it hasn't been stopped.
   */
  stopTimestamp: Date | null;
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

  /**
   * Determine if this Jam has started.
   *
   * @returns true if this Jam has started.
   */
  hasStarted(): boolean {
    return this.startTimestamp != null;
  }

  /**
   * Determine if this Jam is currently running.
   *
   * @returns true if this Jam is currently running.
   */
  isRunning(): boolean {
    return this.hasStarted() && this.stopTimestamp == null;
  }
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
  timestamp: Date;
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

/**
 * Get a Jam from the server.
 *
 * @param boutUuid the Bout UUID of the desired Jam.
 * @param periodNum the Period number of the desired Jam.
 * @param jamNum the Jam number of the desired Jam.
 * @returns the desired Jam.
 */
export async function getJam(
  boutUuid: string,
  periodNum: number,
  jamNum: number,
): Promise<Jam> {
  const data = await localAPI.get<Partial<Jam>>("jam", {
    query: { boutUuid, periodNum, jamNum },
  });
  data.teamJams = data.teamJams?.map((tj) => Object.assign(new TeamJam(), tj));
  return Object.assign(new Jam(), data);
}

/**
 * Add a Trip to the desired TeamJam.
 *
 * @param boutUuid the UUID of the desired Jam.
 * @param boutUuid the Bout UUID of the desired Jam.
 * @param periodNum the Period number of the desired Jam.
 * @param jamNum the Jam number of the desired Jam.
 * @param teamNum the unique Team number of the Team to which to add a Trip.
 * @param passes the number of passes to add to the Trip.
 */
export async function addJamTrip(
  boutUuid: string,
  periodNum: number,
  jamNum: number,
  teamNum: number,
  passes: number,
) {
  await localAPI.post("jam/addTrip", {
    query: {
      boutUuid,
      periodNum,
      jamNum,
      teamNum,
    },
    body: passes,
  });
}

/**
 * Add a Lead event to the desired TeamJam.
 *
 * @param boutUuid the UUID of the desired Jam.
 * @param boutUuid the Bout UUID of the desired Jam.
 * @param periodNum the Period number of the desired Jam.
 * @param jamNum the Jam number of the desired Jam.
 * @param teamNum the unique Team number of the Team to which to add a Trip.
 * @param lead
 */
export async function addJamLead(
  boutUuid: string,
  periodNum: number,
  jamNum: number,
  teamNum: number,
  lead: boolean,
) {
  await localAPI.post("jam/setLead", {
    query: {
      boutUuid,
      periodNum,
      jamNum,
      teamNum,
    },
    body: lead,
  });
}

/**
 * Add a Lost event to the desired TeamJam.
 *
 * @param boutUuid the UUID of the desired Jam.
 * @param boutUuid the Bout UUID of the desired Jam.
 * @param periodNum the Period number of the desired Jam.
 * @param jamNum the Jam number of the desired Jam.
 * @param teamNum the unique Team number of the Team to which to add a Trip.
 * @param lost
 */
export async function addJamLost(
  boutUuid: string,
  periodNum: number,
  jamNum: number,
  teamNum: number,
  lost: boolean,
) {
  await localAPI.post("jam/setLost", {
    query: {
      boutUuid,
      periodNum,
      jamNum,
      teamNum,
    },
    body: lost,
  });
}

/**
 * Add a Star Pass event to the desired TeamJam.
 *
 * @param boutUuid the UUID of the desired Jam.
 * @param boutUuid the Bout UUID of the desired Jam.
 * @param periodNum the Period number of the desired Jam.
 * @param jamNum the Jam number of the desired Jam.
 * @param teamNum the unique Team number of the Team to which to add a Trip.
 * @param starPass
 */
export async function addJamStarPass(
  boutUuid: string,
  periodNum: number,
  jamNum: number,
  teamNum: number,
  starPass: boolean,
) {
  await localAPI.post("jam/setStarPass", {
    query: {
      boutUuid,
      periodNum,
      jamNum,
      teamNum,
    },
    body: starPass,
  });
}
