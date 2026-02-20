import { Timeout } from "@/lib/game/timeouts";
import { MutationOptions } from "@/types/query";
import { useMutation } from "@tanstack/react-query";

export const useSetTimeoutRetained = (
  timeout: Timeout,
  options?: MutationOptions<void, Error, boolean>,
) =>
  useMutation({
    mutationFn: (retained: boolean) => timeout.setRetained(retained),
    ...options,
  });
