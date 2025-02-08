import { BoutIdType } from "../types/bout";
import { JamIdType } from "../types/jam";
import { getActiveJamId } from "../utils/jamId";
import useBout from "./use-bout";

export default function useActiveJamId(boutId: BoutIdType): JamIdType {
  const activeJamId: JamIdType = useBout(boutId, (bout) =>
    getActiveJamId(bout.numJams, bout.playState)
  );

  return activeJamId;
}
