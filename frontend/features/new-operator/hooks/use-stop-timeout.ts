import { localAPI } from "@/lib/requests";
import { AppMutationOptions } from "@/types/query";
import { useMutation } from "@tanstack/react-query";

interface UseStopTimeoutProps extends AppMutationOptions<void> {
  boutUuid: string;
}

/**
 * Used to stop the current Timeout of the desired Bout.
 *
 * @returns A Tanstack Mutation object which can fire the StopTimeout mutator.
 */
export const useStopTimeout = ({ boutUuid, ...options }: UseStopTimeoutProps) =>
  useMutation({
    mutationFn: () =>
      localAPI.post<void>("bout/stopTimeout", {
        query: { boutUuid },
      }),
    ...options,
  });
