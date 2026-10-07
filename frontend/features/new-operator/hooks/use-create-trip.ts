import { localAPI } from "@/lib/requests";
import { Team } from "@/types/bout";
import { AppMutationOptions } from "@/types/query";
import { useMutation } from "@tanstack/react-query";

export interface UseTeamJamAddTripProps extends AppMutationOptions<
  void,
  unknown,
  number
> {
  team: Team;
}

/**
 * Adds a jam trip to the TeamJam.
 *
 * @returns A Tanstack Mutation object which can fire the addJamTrip mutator.
 */
export const useCreateTrip = ({ team, ...options }: UseTeamJamAddTripProps) =>
  useMutation({
    mutationFn: (passes: number) =>
      localAPI.post<void>("bout/addTrip", {
        query: { teamUuid: team.uuid },
        body: passes,
      }),
    ...options,
  });
