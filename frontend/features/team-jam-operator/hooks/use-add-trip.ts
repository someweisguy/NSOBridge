import { localAPI } from "@/lib/requests";
import { AppMutationOptions } from "@/types/query";
import { useMutation } from "@tanstack/react-query";

interface UseTeamJamAddTripOptions extends AppMutationOptions<
  void,
  unknown,
  number
> {
  teamUuid: string;
}

/**
 * Adds a jam trip to the TeamJam, triggering side-effects.
 *
 * This mutation may trigger side-effects depending on the ruleset in use by
 * this Bout.
 *
 * @returns A Tanstack Mutation object which can fire the addJamTrip mutator.
 */
export const useAddTrip = ({
  teamUuid,
  ...options
}: UseTeamJamAddTripOptions) =>
  useMutation({
    mutationFn: (passes: number) =>
      localAPI.post<void>("bout/team/trip", {
        query: { teamUuid },
        body: passes,
      }),
    ...options,
  });
