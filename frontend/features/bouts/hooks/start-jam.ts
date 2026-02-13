import { Bout } from "@/lib/game/bouts";
import { useMutation } from "@tanstack/react-query";

export const useStartJam = (bout: Bout) =>
  useMutation({
    mutationFn: () => bout.startJam(),
  });
