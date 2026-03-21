import { localAPI } from "@/lib/requests";
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
      localAPI.post<void>("timeout/type", {
        query: { boutUuid, num: timeoutNum },
        body: JSON.stringify(type),
      }),
    ...options,
  });
