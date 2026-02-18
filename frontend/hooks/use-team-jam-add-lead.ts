import { Jam, TeamJam } from "@/lib/game/jams";
import { MutationOptions } from "@/types/query";
import { useMutation } from "@tanstack/react-query";

export const useTeamJamAddLead = (
  jam: Jam,
  teamJam: TeamJam,
  options?: MutationOptions<void, unknown, boolean>,
) =>
  useMutation({
    mutationFn: (lead: boolean) => jam.setLead(teamJam, lead),
    ...options,
  });
