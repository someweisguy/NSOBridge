import { sendQuery } from "../../../app/client";
import { JamIdType } from "../../../types/JamIdType";


export async function setLead(boutId: string, jamId: JamIdType, team: string,
  lead: boolean): Promise<null> {
  return await sendQuery<null>("score", "setLead",
    { boutId, jamId, team, lead }
  );
}
