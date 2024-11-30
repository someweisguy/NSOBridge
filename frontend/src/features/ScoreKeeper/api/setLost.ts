import { sendQuery } from "../../../app/client";
import { JamIdType } from "../../../types/JamIdType";


export async function setLost(boutId: string, jamId: JamIdType, team: string,
  lost: boolean): Promise<null> {
  return await sendQuery<null>("score", "setLost",
    { boutId, jamId, team, lost }
  );
}
