import { localAPI } from "@/lib/requests";
import { AppMutationOptions } from "@/types/query";
import { useMutation } from "@tanstack/react-query";

export interface UseStartTimeoutProps extends AppMutationOptions<void> {
  boutUuid: string;
}

/**
 * Used to start a new Timeout in the desired Bout.
 *
 * @returns A Tanstack Mutation object which can fire the StartTimeout mutator.
 */
export const useStartTimeout = ({
  boutUuid,
  ...options
}: UseStartTimeoutProps) =>
  useMutation({
    mutationFn: () =>
      localAPI.post<void>("bout/startTimeout", {
        query: { boutUuid },
      }),
    ...options,
  });
