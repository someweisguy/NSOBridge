import { Timeout } from "@/lib/game/timeouts";
import { MutationOptions } from "@/types/query";
import { useMutation } from "@tanstack/react-query";

export const useSetTimeoutType = (
  timeout: Timeout,
  options?: MutationOptions<void, unknown, "timeout" | "review">,
) =>
  useMutation({
    mutationFn: (type: "timeout" | "review") => timeout.setType(type),
    ...options,
  });
