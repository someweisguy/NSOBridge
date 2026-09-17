import { localAPI } from "@/lib/requests";
import { AppMutationOptions, TeamUri } from "@/types/query";
import { useMutation } from "@tanstack/react-query";

/**
 * Used to set the number of reviews that the desired Team has remaining.
 *
 * @returns A Tanstack Mutation object which can fire the
 * useSetTeamReviewsRemaining mutator.
 */
export const useSetTeamReviewsRemaining = ({
  boutUuid,
  teamNum,
  ...options
}: TeamUri & AppMutationOptions<void, unknown, number>) =>
  useMutation({
    mutationFn: (numReviews: number) =>
      localAPI.put<void>("bout/teamReviewsRemaining", {
        query: { boutUuid, teamNum },
        body: JSON.stringify(numReviews),
      }),
    ...options,
  });
