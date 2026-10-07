import { localAPI } from "@/lib/requests";
import { AppMutationOptions } from "@/types/query";
import { useMutation } from "@tanstack/react-query";

export interface UseBeginPeriodProps extends AppMutationOptions<void> {
  uuid: string;
}

/**
 * Used to begin the Period of the desired Bout.
 *
 * @returns A Tanstack Mutation object which can fire the BeginPeriod mutator.
 */
export const useBeginPeriod = ({ uuid, ...options }: UseBeginPeriodProps) =>
  useMutation({
    mutationFn: () =>
      localAPI.post<void>("bout/beginPeriod", { query: { uuid } }),
    ...options,
  });
