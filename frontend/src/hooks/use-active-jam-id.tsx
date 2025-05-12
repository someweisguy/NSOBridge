import { selectActiveJamId } from "@/lib/client/api/bout";
import useBout from "./use-bout";

export default function useActiveJamId(boutId: string): [number, number] {
  return useBout<[number, number]>(boutId, selectActiveJamId);
}
