import dispatchRequest from "../lib/client";
import { JamIdType } from "../types/jam";

export async function setLead(
  boutId: string,
  jamId: JamIdType,
  team: string,
  lead: boolean
): Promise<null> {
  return await dispatchRequest<null>("score", "setLead", {
    boutId,
    jamId,
    team,
    lead,
  });
}
