import { localAPI } from "@/lib/requests";
import { AppMutationOptions } from "@/types/query";
import { useMutation } from "@tanstack/react-query";

export interface UseTeamJamAddTripProps extends AppMutationOptions<
  void,
  unknown,
  number
> {
  jamUuid: string;
  teamNum: number;
}

/**
 * Adds a jam trip to the TeamJam.
 *
 * @returns A Tanstack Mutation object which can fire the addJamTrip mutator.
 */
export const useTeamJamAddTrip = ({
  jamUuid,
  teamNum,
  ...options
}: UseTeamJamAddTripProps) =>
  useMutation({
    mutationFn: (passes: number) =>
      localAPI.post<void>("bout/addTrip", {
        query: {
          jamUuid,
          teamNum,
        },
        body: passes,
      }),
    ...options,
  });
