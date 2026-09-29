import { useSuspenseJam } from "@/hooks/use-jam";
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
  let uuid: string | null = null;
  for (const period of bout.jamUuids) {
    if (period.length > 0) {
      uuid = period[period.length - 1];
    }
  }
  if (uuid == null) {
    throw new Error("There are no Jams in this Bout");
  }

  return useSuspenseJam({ uuid });
}
