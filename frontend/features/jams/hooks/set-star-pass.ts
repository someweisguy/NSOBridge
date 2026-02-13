import { Jam, TeamJam } from "@/lib/game/jams";
import { useMutation } from "@tanstack/react-query";

export const useSetStarPass = (jam: Jam, teamJam: TeamJam) =>
  useMutation({
    mutationFn: (starPass: boolean) => jam.setStarPass(teamJam, starPass),
  });
