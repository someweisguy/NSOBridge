import { useGetter } from "../app/client";
import { BoutType } from "../types/BoutType";


export default function useBout(boutId: string): BoutType {
  return useGetter<BoutType>("bout", { boutId });
}
