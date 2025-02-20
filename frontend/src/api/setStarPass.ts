import dispatchRequest from "../lib/client";
import { JamIdType } from "../types/jam";

export async function setStarPass(
  boutId: string,
  jamId: JamIdType,
  team: string,
  starPass: boolean
): Promise<null> {
  return await dispatchRequest<null>("score", "setStarPass", {
    boutId,
    jamId,
    team,
    starPass,
  });
}
