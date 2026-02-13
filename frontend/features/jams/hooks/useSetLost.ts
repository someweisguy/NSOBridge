import { Jam, TeamJam } from "@/lib/game/jams";
import { useMutation } from "@tanstack/react-query";

export const useSetLost = (jam: Jam, teamJam: TeamJam) =>
  useMutation({
    mutationFn: (lost: boolean) => jam.setLost(teamJam, lost),
  });
