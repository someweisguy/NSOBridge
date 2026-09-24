import { useSuspenseJam } from "@/features/jams/hooks/use-jam";
import { Bout } from "@/types/bout";

/**
 * Get the active Jam from the desired Bout. If there is no active Jam, the
 * latest Jam is returned.
 *
 * This function suspends the React component.
 *
 * @param bout The desired Bout.
 * @returns A Tanstack Suspense Query object pointing to the active Jam.
 */
export default function useSuspenseActiveJam(bout: Bout) {
  return useSuspenseJam({
    boutUuid: bout.uuid,
    periodNum: bout.jamHead.periodNum,
    jamNum: bout.jamHead.jamNum,
  });
}
