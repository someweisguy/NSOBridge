import { localAPI } from "@/lib/requests";
import { AppMutationOptions } from "@/types/query";
import { useMutation } from "@tanstack/react-query";

export interface UseTeamJamAddLostProps extends AppMutationOptions<
  void,
  unknown,
  boolean
> {
  jamUuid: string;
  teamNum: number;
}

/**
 * Sets the lost lead Jam status of this TeamJam.
 *
 * @returns A Tanstack Mutation object which can fire the addJamLost mutator.
 */
export const useTeamJamAddLost = ({
  jamUuid,
  teamNum,
  ...options
}: UseTeamJamAddLostProps) =>
  useMutation({
    mutationFn: (lost: boolean) =>
      localAPI.post<void>("bout/addLost", {
        query: {
          jamUuid,
          teamNum,
        },
        body: lost,
      }),
    ...options,
  });
