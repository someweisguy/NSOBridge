import { localAPI } from "@/lib/requests";
import { AppMutationOptions } from "@/types/query";
import { useMutation } from "@tanstack/react-query";

export interface UseSetBoutClockRemainingProps extends AppMutationOptions<
  void,
  Error,
  number
> {
  boutUuid: string;
}

/**
 * Used to set the clock of the desired Bout.
 *
 * @returns A Tanstack Mutation object which can fire the setBoutClockElapsed mutator.
 */
export const useSetBoutClockRemaining = ({
  boutUuid,
  ...options
}: UseSetBoutClockRemainingProps) =>
  useMutation({
    mutationFn: (remaining: number) =>
      localAPI.put<void>("bout/setClockRemaining", {
        query: { boutUuid },
        body: remaining,
      }),
    ...options,
  });
