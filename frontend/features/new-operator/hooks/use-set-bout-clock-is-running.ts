import { localAPI } from "@/lib/requests";
import { AppMutationOptions } from "@/types/query";
import { useMutation } from "@tanstack/react-query";

export interface UseSetBoutClockIsRunningProps extends AppMutationOptions<
  void,
  unknown,
  boolean
> {
  boutUuid: string;
}

/**
 * Used to set the clock of the desired Bout.
 *
 * @returns A Tanstack Mutation object which can fire the setBoutClockElapsed mutator.
 */
export const useSetBoutClockIsRunning = ({
  boutUuid,
  ...options
}: UseSetBoutClockIsRunningProps) =>
  useMutation({
    mutationFn: (isRunning: boolean) =>
      localAPI.put<void>("bout/setClockIsRunning", {
        query: { boutUuid },
        body: isRunning,
      }),
    ...options,
  });
