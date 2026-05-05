import { useSuspenseJam } from "@/hooks/use-suspense-jam";
import { Jam } from "@/types/jam";
import { TeamJamUri } from "@/types/query";
import { useCallback } from "react";

/**
 * Get the state of the Jammer in the specified TeamJam.
 *
 * @returns "starPass", "lost", "lead", or "none" depending on the state of the Jammer.
 */
export const useSuspenseJammerState = ({
  boutUuid,
  periodNum,
  jamNum,
  teamNum,
}: TeamJamUri) =>
  useSuspenseJam<"starPass" | "lost" | "lead" | "none">({
    boutUuid,
    periodNum,
    jamNum,
    select: useCallback(
      (jam: Jam) => {
        const teamJam = jam.teamJams.find((tj) => tj.teamNum == teamNum);
        if (teamJam == null) {
          throw new Error("unable to find TeamJam");
        }

        // Determine the state of the Jammer
        if (teamJam.events.some((event) => event.starPass)) {
          return "starPass";
        } else if (teamJam.events.some((event) => event.lost)) {
          return "lost";
        } else if (teamJam.events.some((event) => event.lead)) {
          return "lead";
        } else {
          return "none";
        }
      },
      [teamNum],
    ),
  });
