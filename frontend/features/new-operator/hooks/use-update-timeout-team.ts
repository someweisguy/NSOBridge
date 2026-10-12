import { localAPI } from "@/lib/requests";
import { AppMutationOptions } from "@/types/query";
import { Timeout } from "@/types/timeout";
import { useMutation } from "@tanstack/react-query";

export interface UseUpdateTimeoutTeamProps extends AppMutationOptions<
  void,
  Error,
  string | null
> {
  timeout: Timeout;
}

/**
 * Sets the calling Team of the desired Timeout. Setting the calling team number to
 * `null` means that the Timeout was called by the officials.
 *
 * @returns A Tanstack Mutation object which can fire the updateTimeoutTeam mutator.
 */
export const useUpdateTimeoutTeam = ({
  timeout,
  ...options
}: UseUpdateTimeoutTeamProps) =>
  useMutation({
    mutationFn: (teamUuid: string | null) =>
      localAPI.post<void>("timeout/team", {
        query: { uuid: timeout.uuid },
        body: JSON.stringify(teamUuid),
      }),
    ...options,
  });
