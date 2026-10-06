import { localAPI } from "@/lib/requests";
import { AppMutationOptions } from "@/types/query";
import { useMutation } from "@tanstack/react-query";

export interface UseStopJamProps extends AppMutationOptions<void> {
  boutUuid: string;
}

/**
 * Used to stop the latest Jam of the desired Bout.
 *
 * @returns A Tanstack Mutation object which can fire the StopJam mutator.
 */
export const useStopJam = ({ boutUuid, ...options }: UseStopJamProps) =>
  useMutation({
    mutationFn: () =>
      localAPI.post<void>("bout/stopJam", { query: { boutUuid } }),
    ...options,
  });
