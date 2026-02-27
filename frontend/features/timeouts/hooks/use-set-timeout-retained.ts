import { setRetained } from "@/lib/game/timeouts";
import { MutationOptions } from "@/types/query";
import { useMutation } from "@tanstack/react-query";

export const useSetTimeoutRetained = (
  boutUuid: string,
  timeoutNum: number,
  options?: MutationOptions<void, Error, boolean>,
) =>
  useMutation({
    mutationFn: (retained: boolean) =>
      setRetained(boutUuid, timeoutNum, retained),
    ...options,
  });
