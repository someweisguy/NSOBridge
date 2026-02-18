import { Jam, TeamJam } from "@/lib/game/jams";
import { MutationOptions } from "@/types/query";
import { useMutation } from "@tanstack/react-query";

export const useSetLost = (
  jam: Jam,
  teamJam: TeamJam,
  options?: MutationOptions<void, unknown, boolean>,
) =>
  useMutation({
    mutationFn: (lost: boolean) => jam.setLost(teamJam, lost),
    ...options,
  });
