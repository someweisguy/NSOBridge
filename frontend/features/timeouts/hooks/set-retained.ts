import { Timeout } from "@/lib/game/timeouts";
import { useMutation } from "@tanstack/react-query";

export const useSetRetained = (timeout: Timeout) =>
  useMutation({
    mutationFn: (retained: boolean) => timeout.setRetained(retained),
  });
