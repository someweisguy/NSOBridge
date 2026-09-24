import { useSuspenseJam } from "@/features/jams/hooks/use-jam";
import { Bout } from "@/types/bout";

/**
 * Get the active Jam from the desired Bout.
 *
 * This function suspends the React component.
 *
 * @param bout The desired Bout.
 * @returns A Tanstack Suspense Query object pointing to the active Jam.
 */
export default function useSuspenseLatestJam(bout: Bout) {
  let periodNum = 0;
  for (let i = bout.jamCounts.length - 1; i >= 0; --i) {
    // Get the latest Period number that contains Jams
    if (bout.jamCounts[i] > 0) {
      periodNum = i;
      break;
    }
  }
  const jamNum = bout.jamCounts[periodNum] - 1;

  return useSuspenseJam({
    boutUuid: bout.uuid,
    periodNum,
    jamNum,
  });
}
