import { Bout } from "@/shared/lib/game/bouts/types";
import { Jam } from "@/shared/lib/game/jams/types";
import useCurrentJam from "./use-current-jam";
import useUpcomingJam from "./use-upcoming-jam";

export default function useCurrentOrUpcomingJam(bout: Bout): Jam {
  const currentJam = useCurrentJam(bout);
  const upcomingJam = useUpcomingJam(bout);

  if (currentJam == null) {
    return upcomingJam!;
  }

  return currentJam;
}
