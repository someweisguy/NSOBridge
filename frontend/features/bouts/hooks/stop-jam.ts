import { Bout } from "@/lib/game/bouts";
import { useMutation } from "@tanstack/react-query";

export const useStopJam = (bout: Bout) =>
  useMutation({
    mutationFn: () => bout.stopJam(),
  });
