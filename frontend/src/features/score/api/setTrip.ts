import { sendQuery } from "../../../hooks/client";
import { JamId } from "../../../hooks/jam";

export default async function setTrip(boutId: string, jamId: JamId, team: string,
  tripId: number, points: number, validPass: boolean = true): Promise<null> {
  return await sendQuery<null>("score", "setTrip",
    { boutId, jamId, team, tripId, points, validPass }
  );
}
