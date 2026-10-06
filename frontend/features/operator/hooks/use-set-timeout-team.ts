import { localAPI } from "@/lib/requests";
import { AppMutationOptions } from "@/types/query";
import { useMutation } from "@tanstack/react-query";

export interface UseSetTimeoutTeamProps extends AppMutationOptions<
  void,
  Error,
  number | null
> {
  timeoutUuid: string;
}

/**
 * Sets the calling Team of the desired Timeout. Setting the calling team number to
 * `null` means that the Timeout was called by the officials.
 *
 * @returns A Tanstack Mutation object which can fire the setTeam mutator.
 */
export const useSetTimeoutTeam = ({
  timeoutUuid,
  ...options
}: UseSetTimeoutTeamProps) =>
  useMutation({
    mutationFn: (teamNum: number | null) =>
      localAPI.post<void>("timeout/team", {
        query: { timeoutUuid },
        body: teamNum,
      }),
    ...options,
  });
