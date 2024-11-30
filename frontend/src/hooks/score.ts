import { sendQuery } from "./client";
import { JamId } from "./jam";


export async function setLead(boutId: string, jamId: JamId, team: string,
  lead: boolean): Promise<null> {
  return await sendQuery<null>("score", "setLead",
    { boutId, jamId, team, lead }
  );
}
