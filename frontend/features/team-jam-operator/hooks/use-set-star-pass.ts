import { localAPI } from "@/lib/requests";
import { AppMutationOptions } from "@/types/query";
import { useMutation } from "@tanstack/react-query";

interface UseSetStarPassOptions extends AppMutationOptions<
  void,
  unknown,
  boolean
> {
  teamUuid: string;
}

/**
 * Adds or removes a Star Pass to the active Jam of the specified Team.
 *
 * @returns A Tanstack Mutation object which can fire the setStarPass mutator.
 */
export const useSetStarPass = ({
  teamUuid,
  ...options
}: UseSetStarPassOptions) =>
  useMutation({
    mutationFn: (starPass: boolean) =>
      localAPI.post<void>("bout/team/starPass", {
        // TODO: should this be bout/starPass?
        query: { teamUuid },
        body: starPass,
      }),
    ...options,
  });
