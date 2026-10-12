import { localAPI } from "@/lib/requests";
import { AppMutationOptions } from "@/types/query";
import { useMutation } from "@tanstack/react-query";

export interface UseUpdateTimeoutTypeProps extends AppMutationOptions<
  void,
  Error,
  "timeout" | "review"
> {
  timeoutUuid: string;
}

/**
 * Sets the Timeout type, whether it is a timeout or official review.
 *
 * @returns A Tanstack Mutation object which can fire the updateTimeoutType mutator.
 */
export const useUpdateTimeoutType = ({
  timeoutUuid,
  ...options
}: UseUpdateTimeoutTypeProps) =>
  useMutation({
    mutationFn: (type: "timeout" | "review") =>
      localAPI.put<void>("timeout/type", {
        query: { timeoutUuid },
        body: JSON.stringify(type),
      }),
    ...options,
  });
