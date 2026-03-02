import { Jam, TeamJam } from "@/lib/game/jams";
import { MutationOptions } from "@/types/query";
import { useMutation } from "@tanstack/react-query";

export const useTeamJamAddTrip = (
  jam: Jam,
  teamJam: TeamJam,
  options?: MutationOptions<void, unknown, number>,
) =>
  useMutation({
    mutationFn: (passes: number) => jam.addTrip(teamJam, passes),
    ...options,
  });
