import { setType } from "@/lib/game/timeouts";
import { MutationOptions } from "@/types/query";
import { useMutation } from "@tanstack/react-query";

export const useSetTimeoutType = (
  boutUuid: string,
  timeoutNum: number,
  options?: MutationOptions<void, unknown, "timeout" | "review">,
) =>
  useMutation({
    mutationFn: (type: "timeout" | "review") =>
      setType(boutUuid, timeoutNum, type),
    ...options,
  });
