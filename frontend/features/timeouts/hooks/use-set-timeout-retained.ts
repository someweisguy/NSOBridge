import { localAPI } from "@/lib/requests";
import { AppMutationOptions, TimeoutUri } from "@/types/query";
import { useMutation } from "@tanstack/react-query";

/**
 * Sets whether or not the desired Timeout is retained.
 *
 * @returns A Tanstack Mutation object which can fire the setRetained mutator.
 */
export const useSetTimeoutRetained = ({
  boutUuid,
  timeoutNum,
  ...options
}: TimeoutUri & AppMutationOptions<void, Error, boolean>) =>
  useMutation({
    mutationFn: (isRetained: boolean) =>
      localAPI.post<void>("timeout/retained", {
        query: { boutUuid, num: timeoutNum }, // TODO: fix alias
        body: isRetained,
      }),
    ...options,
  });
