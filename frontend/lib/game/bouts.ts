import { localAPI } from "@/lib/requests";
import { Bout } from "@/types/game";

export interface BoutContext {
  jamDuration: number;
  lineupDuration: number;
  pointsPerTrip: number;
  numTimeouts: number;
  numReviews: number;
}

export async function getBout(boutId: number): Promise<Bout> {
  const data = await localAPI.get("bout", { query: { boutId } });
  return Object.assign(new Bout(), data);
}

export async function getBoutContext(boutId: number): Promise<BoutContext> {
  return localAPI.get<BoutContext>("bout/context", { query: { boutId } });
}

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

export async function beginPeriod(boutId: number): Promise<void> {
  await localAPI.post("bout/begin-period", { query: { boutId } });
}

export async function endPeriod(boutId: number): Promise<void> {
  await localAPI.post("bout/end-period", { query: { boutId } });
}

export async function startJam(boutId: number): Promise<void> {
  await localAPI.post("bout/start-jam", { query: { boutId } });
}

export async function stopJam(boutId: number): Promise<void> {
  await localAPI.post("bout/stop-jam", { query: { boutId } });
}

export async function startTimeout(boutId: number): Promise<void> {
  await localAPI.post("bout/start-timeout", { query: { boutId } });
}

export async function stopTimeout(boutId: number): Promise<void> {
  await localAPI.post("bout/stop-timeout", { query: { boutId } });
}
