import { localAPI } from "@/lib/requests";
import { AppMutationOptions } from "@/types/query";
import { useMutation } from "@tanstack/react-query";

export interface UseSetTimeoutRetainedProps extends AppMutationOptions<
  void,
  Error,
  boolean
> {
  timeoutUuid: string;
}

/**
 * Sets whether or not the desired Timeout is retained.
 *
 * @returns A Tanstack Mutation object which can fire the setRetained mutator.
 */
export const useSetTimeoutRetained = ({
  timeoutUuid,
  ...options
}: UseSetTimeoutRetainedProps) =>
  useMutation({
    mutationFn: (isRetained: boolean) =>
      localAPI.post<void>("timeout/retained", {
        query: { timeoutUuid },
        body: isRetained,
      }),
    ...options,
  });
