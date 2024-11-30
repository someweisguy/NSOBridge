import { useGetter } from "../app/client";
import { JamIdType } from "../types/JamIdType";
import { JamType } from "../types/JamType";


export default function useJam(boutId: string, jamId: JamIdType): JamType {
  return useGetter<JamType>("jam", { boutId, jamId });
}
