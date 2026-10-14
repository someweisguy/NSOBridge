import { localAPI } from "@/lib/requests";
import { AppMutationOptions } from "@/types/query";
import { useMutation } from "@tanstack/react-query";

export interface UseStartJamProps extends AppMutationOptions<void> {
  uuid: string;
}

/**
 * Used to start the latest Jam of the desired Bout.
 *
 * @returns A Tanstack Mutation object which can fire the StartJam mutator.
 */
export const useStartJam = ({ uuid, ...options }: UseStartJamProps) =>
  useMutation({
    mutationFn: () => localAPI.post<void>("bout/startJam", { query: { uuid } }),
    ...options,
  });
