import { Jam, TeamJam } from "@/lib/game/jams";
import { MutationOptions } from "@/types/query";
import { useMutation } from "@tanstack/react-query";

export const useTeamJamAddStarPass = (
  jam: Jam,
  teamJam: TeamJam,
  options?: MutationOptions<void, unknown, boolean>,
) =>
  useMutation({
    mutationFn: (starPass: boolean) => jam.setStarPass(teamJam, starPass),
    ...options,
  });
