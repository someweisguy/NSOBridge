import { Bout } from "@/lib/game/bouts";
import { useMutation } from "@tanstack/react-query";

export const useStartTimeout = (bout: Bout) =>
  useMutation({
    mutationFn: () => bout.startTimeout(),
  });
