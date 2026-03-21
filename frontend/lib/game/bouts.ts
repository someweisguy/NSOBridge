import { localAPI } from "@/lib/requests";

/**
 * Create a new Bout.
 *
 * // TODO: this function has not been tested and does not work
 *
 * @param rosterIds
 * @param seriesIndex
 * @param order
 */
export async function createBout(
  rosterIds: number[],
  seriesIndex = 1,
  order = 0,
): Promise<void> {
  await localAPI.post("bout/wftda2025", {
    query: { seriesIndex },
    body: { rosterIds, order },
  });
}

/**
 * Begin the Period of the desired Bout.
 *
 * @param boutUuid the UUID of the desired Bout.
 */
export async function beginPeriod(boutUuid: string): Promise<void> {
  await localAPI.post("bout/beginPeriod", { query: { boutUuid } });
}

/**
 * End the Period of the desired Bout.
 *
 * @param boutUuid the UUID of the desired Bout.
 */
export async function endPeriod(boutUuid: string): Promise<void> {
  await localAPI.post("bout/endPeriod", { query: { boutUuid } });
}

/**
 * Start the latest Jam of the desired Bout.
 *
 * @param boutUuid the UUID of the desired Bout.
 */
export async function startJam(boutUuid: string): Promise<void> {
  await localAPI.post("bout/startJam", { query: { boutUuid } });
}

/**
 * Stop the active Jam of the desired Bout.
 *
 * @param boutUuid the UUID of the desired Bout.
 */
export async function stopJam(boutUuid: string): Promise<void> {
  await localAPI.post("bout/stopJam", { query: { boutUuid } });
}

/**
 * Create and start a new Timeout in the desired Bout.
 *
 * @param boutUuid the UUID of the desired Bout.
 */
export async function startTimeout(boutUuid: string): Promise<void> {
  await localAPI.post("bout/startTimeout", {
    query: { boutUuid },
  });
}

/**
 * Stop the latest Timeout in the desired Bout.
 *
 * @param boutUuid the UUID of the desired Bout.
 */
export async function stopTimeout(boutUuid: string): Promise<void> {
  await localAPI.post("bout/stopTimeout", {
    query: { boutUuid },
  });
}
