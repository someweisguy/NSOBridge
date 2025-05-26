import { selectLatestJamId } from "@/lib/client/api/bout";
import { Bout } from "@/lib/client/api/types";
import useBout from "./use-bout";

export default function useLatestJamId(
  boutId: string,
  offset = 0,
  returnOutOfBounds = false
): [number, number] {
  return useBout<[number, number]>(boutId, (bout: Bout) =>
    selectLatestJamId(bout, offset, returnOutOfBounds)
  );
}
