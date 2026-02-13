import { Bout } from "@/lib/game/bouts";
import { useMutation } from "@tanstack/react-query";

export const useStopTimeout = (bout: Bout) =>
  useMutation({
    mutationFn: () => bout.stopTimeout(),
  });
