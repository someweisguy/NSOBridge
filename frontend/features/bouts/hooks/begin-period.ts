import { Bout } from "@/lib/game/bouts";
import { useMutation } from "@tanstack/react-query";

export const useBeginPeriod = (bout: Bout) =>
  useMutation({
    mutationFn: () => bout.beginPeriod(),
  });
