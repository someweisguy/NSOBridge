import { localAPI } from "@/lib/requests";

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
