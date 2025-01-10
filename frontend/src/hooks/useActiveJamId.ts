import { BoutIdType } from "../types/BoutIdType";
import { getActiveJamId } from "../utils/jamId";
import useBout from "./useBout";

export default function useActiveJamId(boutId: BoutIdType): [number, number] {
  const activeJamId: [number, number] = useBout(boutId, (bout) =>
    getActiveJamId(bout.numJams, bout.playState)
  );

  return activeJamId;
}
