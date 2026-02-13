import { Timeout } from "@/lib/game/timeouts";
import { useMutation } from "@tanstack/react-query";

export const useSetTeam = (timeout: Timeout) =>
  useMutation({
    mutationFn: (teamNum: number | null) => timeout.setTeam(teamNum),
  });
