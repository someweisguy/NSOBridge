import { setType } from "@/lib/game/timeouts";
import { MutationOptions, TimeoutUri } from "@/types/query";
import { useMutation } from "@tanstack/react-query";

/**
 * Sets the Timeout type, whether it is a timeout or official review.
 *
 * @returns A Tanstack Mutation object which can fire the setType mutator.
 */
export const useSetTimeoutType = ({
  boutUuid,
  timeoutNum,
  ...options
}: TimeoutUri & MutationOptions<void, Error, "timeout" | "review">) =>
  useMutation({
    mutationFn: (type: "timeout" | "review") =>
      setType(boutUuid, timeoutNum, type),
    ...options,
  });
