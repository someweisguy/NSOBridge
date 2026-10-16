import { localAPI } from "@/lib/requests";
import { AppMutationOptions } from "@/types/query";
import { useMutation } from "@tanstack/react-query";

interface UseSetLostOptions extends AppMutationOptions<void, unknown, boolean> {
  teamUuid: string;
}

/**
 * Adds or removes lost lead status to the active Jam of the specified Team.
 *
 * @returns A Tanstack Mutation object which can fire the setLost mutator.
 */
export const useSetLost = ({ teamUuid, ...options }: UseSetLostOptions) =>
  useMutation({
    mutationFn: (lost: boolean) =>
      localAPI.post<void>("bout/team/lost", {
        query: { teamUuid },
        body: lost,
      }),
    ...options,
  });
