import { sendQuery } from "../../../hooks/client";
import { JamIdType } from "../../../types/JamIdType";

export default async function deleteTrip(boutId: string, jamId: JamIdType, team: string, tripId: number): Promise<null> {
  return await sendQuery<null>("score", "deleteTrip",
    { boutId, jamId, team, tripId }
  );
}