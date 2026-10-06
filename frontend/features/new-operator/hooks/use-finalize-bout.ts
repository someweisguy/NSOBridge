import { localAPI } from "@/lib/requests";
import { AppMutationOptions } from "@/types/query";
import { useMutation } from "@tanstack/react-query";

export interface UseFinalizeBoutProps extends AppMutationOptions<void> {
  boutUuid: string;
}

/**
 * Finalize the desired Bout.
 *
 * @returns A Tanstack Mutation object which can fire the FinalizeBout mutator.
 */
export const useFinalizeBout = ({
  boutUuid,
  ...options
}: UseFinalizeBoutProps) =>
  useMutation({
    mutationFn: () =>
      localAPI.post<void>("bout/finalize", { query: { boutUuid } }),
    ...options,
  });
