import dispatch from "../lib/client";
import { JamIdType } from "../types/jam";

export async function setLost(
  boutId: string,
  jamId: JamIdType,
  team: string,
  lost: boolean
): Promise<null> {
  return await dispatch<null>("score", "setLost", {
    boutId,
    jamId,
    team,
    lost,
  });
}
