import dispatch from "../lib/client";
import { JamIdType } from "../types/jam";


export async function setLead(boutId: string, jamId: JamIdType, team: string,
  lead: boolean): Promise<null> {
  return await dispatch<null>("score", "setLead",
    { boutId, jamId, team, lead }
  );
}
