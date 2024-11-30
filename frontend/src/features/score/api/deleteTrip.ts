import { sendQuery } from "../../../hooks/client";
import { JamId } from "../../../hooks/jam";

export default async function deleteTrip(boutId: string, jamId: JamId, team: string, tripId: number): Promise<null> {
  return await sendQuery<null>("score", "deleteTrip",
    { boutId, jamId, team, tripId }
  );
}