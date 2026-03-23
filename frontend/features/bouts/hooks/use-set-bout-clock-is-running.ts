import { localAPI } from "@/lib/requests";
import { AppMutationOptions, BoutUri } from "@/types/query";
import { useMutation } from "@tanstack/react-query";

/**
 * Used to set the clock of the desired Bout.
 *
 * @returns A Tanstack Mutation object which can fire the setBoutClockElapsed mutator.
 */
export const useSetBoutClockIsRunning = ({
  boutUuid,
  ...options
}: BoutUri & AppMutationOptions<void, unknown, boolean>) =>
  useMutation({
    mutationFn: (isRunning: boolean) =>
      localAPI.post<void>("bout/setClockIsRunning", {
        query: { boutUuid },
        body: isRunning,
      }),
    ...options,
  });
