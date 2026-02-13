import { Jam, TeamJam } from "@/lib/game/jams";
import { useMutation } from "@tanstack/react-query";

export const useSetLead = (jam: Jam, teamJam: TeamJam) =>
  useMutation({
    mutationFn: (lead: boolean) => jam.setLead(teamJam, lead),
  });
