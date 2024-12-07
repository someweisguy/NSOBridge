import dispatch from "../../../app/client";
import { JamIdType } from "../../../types/JamIdType";


export async function setLead(boutId: string, jamId: JamIdType, team: string,
  lead: boolean): Promise<null> {
  return await dispatch<null>("score", "setLead",
    { boutId, jamId, team, lead }
  );
}
