import { setTimeoutType } from "@/lib/game/timeouts";
import { AppMutationOptions, TimeoutUri } from "@/types/query";
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
}: TimeoutUri & AppMutationOptions<void, Error, "timeout" | "review">) =>
  useMutation({
    mutationFn: (type: "timeout" | "review") =>
      setTimeoutType(boutUuid, timeoutNum, type),
    ...options,
  });
