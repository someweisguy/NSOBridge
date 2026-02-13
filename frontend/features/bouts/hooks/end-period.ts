import { Bout } from "@/lib/game/bouts";
import { useMutation } from "@tanstack/react-query";

export const useEndPeriod = (bout: Bout) =>
  useMutation({
    mutationFn: () => bout.endPeriod(),
  });
