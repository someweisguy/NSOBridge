import { localAPI } from "@/lib/requests";
import { AppMutationOptions } from "@/types/query";
import { useMutation } from "@tanstack/react-query";

export interface UseSetTimeoutTypeProps extends AppMutationOptions<
  void,
  Error,
  "timeout" | "review"
> {
  timeoutUuid: string;
}

/**
 * Sets the Timeout type, whether it is a timeout or official review.
 *
 * @returns A Tanstack Mutation object which can fire the setType mutator.
 */
export const useSetTimeoutType = ({
  timeoutUuid,
  ...options
}: UseSetTimeoutTypeProps) =>
  useMutation({
    mutationFn: (type: "timeout" | "review") =>
      localAPI.post<void>("timeout/type", {
        query: { timeoutUuid },
        body: JSON.stringify(type),
      }),
    ...options,
  });
