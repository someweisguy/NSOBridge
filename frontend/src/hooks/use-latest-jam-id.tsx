import { Bout, selectLatestJamId } from "@/lib/client/api/bout";
import useBout from "./use-bout";

export default function useLatestJamId(
  boutId: string,
  offset = 0,
  returnOutOfBounds = true
): [number, number] | null {
  return useBout<[number, number] | null>(boutId, (bout: Bout) =>
    selectLatestJamId(bout, offset, returnOutOfBounds)
  );
}
