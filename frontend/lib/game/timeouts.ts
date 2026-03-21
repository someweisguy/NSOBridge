import { localAPI } from "../requests";

/**
 * Set the desired Timeout to the specified timeout type.
 *
 * @param boutUuid the Bout UUID associated with the desired Timeout.
 * @param timeoutNum the unique Timeout number.
 * @param type the timeout type to which to set the desired Timeout.
 */
export async function setTimeoutType(
  boutUuid: string,
  timeoutNum: number,
  type: "timeout" | "review",
): Promise<void> {
  await localAPI.post("timeout/type", {
    query: { boutUuid, num: timeoutNum },
    body: JSON.stringify(type),
  });
}

/**
 * Set the calling Team of the desired Timeout. Setting teamNum to null means that the
 * desired Timeout was called by the officials.
 *
 * @param boutUuid the Bout UUID associated with the desired Timeout.
 * @param timeoutNum the unique Timeout number.
 * @param teamNum
 */
export async function setTimeoutTeam(
  boutUuid: string,
  timeoutNum: number,
  teamNum: number | null,
): Promise<void> {
  await localAPI.post("timeout/team", {
    query: { boutUuid, num: timeoutNum },
    body: teamNum,
  });
}

/**
 * Set whether or not the desired Timeout or Official Review was retained. Typically if
 * a Team calls an Official Review and the call on the track stands, the calling Team
 * will not retain their Official Review.
 *  *
 * @param boutUuid the Bout UUID associated with the desired Timeout.
 * @param timeoutNum the unique Timeout number.
 * @param isRetained true if this Timeout should be retained.
 */
export async function setTimeoutRetained(
  boutUuid: string,
  timeoutNum: number,
  isRetained: boolean,
): Promise<void> {
  await localAPI.post("timeout/retained", {
    query: { boutUuid, num: timeoutNum },
    body: isRetained,
  });
}
