import { sendQuery } from "../../../app/client";
import { JamIdType } from "../../../types/JamIdType";


export async function setStarPass(boutId: string, jamId: JamIdType, team: string,
  starPass: number | null): Promise<null> {
  return await sendQuery<null>("score", "setStarPass",
    { boutId, jamId, team, starPass }
  );
}
