import { localAPI } from "@/lib/requests";
import { AppMutationOptions } from "@/types/query";
import { Timeout } from "@/types/timeout";
import { useMutation } from "@tanstack/react-query";

export interface UseUpdateTimeoutRetainedProps extends AppMutationOptions<
  void,
  Error,
  boolean
> {
  timeout: Timeout;
}

/**
 * Sets whether or not the desired Timeout is retained.
 *
 * @returns A Tanstack Mutation object which can fire the updateRetained mutator.
 */
export const useUpdateTimeoutRetained = ({
  timeout,
  ...options
}: UseUpdateTimeoutRetainedProps) =>
  useMutation({
    mutationFn: (isRetained: boolean) =>
      localAPI.post<void>("timeout/retained", {
        query: { uuid: timeout.uuid },
        body: isRetained,
      }),
    ...options,
  });
