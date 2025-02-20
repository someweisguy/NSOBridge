import dispatchRequest from "../lib/client";
import { JamIdType } from "../types/jam";

export default async function deleteTrip(
  boutId: string,
  jamId: JamIdType,
  team: string,
  tripId: number
): Promise<null> {
  return await dispatchRequest<null>("score", "deleteTrip", {
    boutId,
    jamId,
    team,
    tripId,
  });
}
