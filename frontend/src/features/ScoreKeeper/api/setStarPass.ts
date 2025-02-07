import dispatch from "../../../app/client";
import { JamIdType } from "../../../types/jam";

export async function setStarPass(
  boutId: string,
  jamId: JamIdType,
  team: string,
  starPass: boolean
): Promise<null> {
  return await dispatch<null>("score", "setStarPass", {
    boutId,
    jamId,
    team,
    starPass,
  });
}
