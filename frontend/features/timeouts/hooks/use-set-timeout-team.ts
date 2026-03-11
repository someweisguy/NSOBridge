import { setTeam } from "@/lib/game/timeouts";
import { MutationOptions, TimeoutUri } from "@/types/query";
import { useMutation } from "@tanstack/react-query";

/**
 * Sets the calling Team of the desired Timeout. Setting the calling team number to
 * `null` means that the Timeout was called by the officials.
 *
 * @returns A Tanstack Mutation object which can fire the setTeam mutator.
 */
export const useSetTimeoutTeam = ({
  boutUuid,
  timeoutNum,
  ...options
}: TimeoutUri & MutationOptions<void, Error, number | null>) =>
  useMutation({
    mutationFn: (teamNum: number | null) =>
      setTeam(boutUuid, timeoutNum, teamNum),
    ...options,
  });
