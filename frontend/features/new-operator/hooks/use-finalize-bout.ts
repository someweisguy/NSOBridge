import { localAPI } from "@/lib/requests";
import { AppMutationOptions } from "@/types/query";
import { useMutation } from "@tanstack/react-query";

export interface UseFinalizeBoutProps extends AppMutationOptions<void> {
  uuid: string;
}

/**
 * Finalize the desired Bout.
 *
 * @returns A Tanstack Mutation object which can fire the FinalizeBout mutator.
 */
export const useFinalizeBout = ({ uuid, ...options }: UseFinalizeBoutProps) =>
  useMutation({
    mutationFn: () => localAPI.post<void>("bout/finalize", { query: { uuid } }),
    ...options,
  });
