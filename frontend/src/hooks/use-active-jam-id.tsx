import { selectActiveJamId } from "@/lib/client/api/bout";
import { Bout } from "@/lib/client/api/types";
import useBout from "./use-bout";

export default function useActiveJamId(
  boutId: string,
  offset = 0,
  returnOutOfBounds = false
): [number, number] | null {
  return useBout<[number, number] | null>(boutId, (bout: Bout) =>
    selectActiveJamId(bout, offset, returnOutOfBounds)
  );
}
