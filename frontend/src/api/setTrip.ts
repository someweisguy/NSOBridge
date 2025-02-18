import dispatch from "../lib/client";
import { JamIdType } from "../types/jam";

export default async function setTrip(
  boutId: string,
  jamId: JamIdType,
  team: string,
  tripId: number,
  points: number,
  validPass = true
): Promise<null> {
  return await dispatch<null>("score", "setTrip", {
    boutId,
    jamId,
    team,
    tripId,
    points,
    validPass,
  });
}
