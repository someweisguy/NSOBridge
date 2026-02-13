import { Timeout } from "@/lib/game/timeouts";
import { useMutation } from "@tanstack/react-query";

export const useSetType = (timeout: Timeout) =>
  useMutation({
    mutationFn: (type: "timeout" | "review") => timeout.setType(type),
  });
