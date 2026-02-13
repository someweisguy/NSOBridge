import { Jam, TeamJam } from "@/lib/game/jams";
import { useMutation } from "@tanstack/react-query";

export const useAddTrip = (jam: Jam, teamJam: TeamJam) =>
  useMutation({
    mutationFn: (passes: number) => jam.addTrip(teamJam, passes),
  });
