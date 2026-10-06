import { localAPI } from "@/lib/requests";
import { AppMutationOptions } from "@/types/query";
import { useMutation } from "@tanstack/react-query";

export interface UseEndPeriodProps extends AppMutationOptions<void> {
  boutUuid: string;
}

/**
 * Used to end the Period of the desired Bout.
 *
 * @returns A Tanstack Mutation object which can fire the EndPeriod mutator.
 */
export const useEndPeriod = ({ boutUuid, ...options }: UseEndPeriodProps) =>
  useMutation({
    mutationFn: () =>
      localAPI.post<void>("bout/endPeriod", { query: { boutUuid } }),
    ...options,
  });
