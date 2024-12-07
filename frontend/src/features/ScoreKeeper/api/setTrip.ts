import dispatch from "../../../app/client";
import { JamIdType } from "../../../types/JamIdType";

export default async function setTrip(boutId: string, jamId: JamIdType, team: string,
  tripId: number, points: number, validPass: boolean = true): Promise<null> {
  return await dispatch<null>("score", "setTrip",
    { boutId, jamId, team, tripId, points, validPass }
  );
}
