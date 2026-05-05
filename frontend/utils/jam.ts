import { TeamJam } from "@/types/jam";

/**
 * Get the number of passes that this TeamJam's jammer has completed.
 *
 * @returns the number of passes that the Jammer has completed.
 */
export const getNumTrips = (teamJam: TeamJam): number => {
  return teamJam.events.filter((tripEvent) => tripEvent.passes != null).length;
};
