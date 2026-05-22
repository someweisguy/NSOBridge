import { localAPI } from "@/lib/requests";
import { StopReasonString } from "@/types/jam";
import { AppMutationOptions, JamUri } from "@/types/query";
import { useMutation } from "@tanstack/react-query";

/**
 * Set the stop reason of the desired Jam.
 *
 * @returns A Tanstack Mutation object which can fire the useSetJamStopReason mutator.
 */
export const useSetJamStopReason = ({
  boutUuid,
  periodNum,
  jamNum,
  ...options
}: JamUri & AppMutationOptions<void, unknown, StopReasonString>) =>
  useMutation({
    mutationFn: (reason: StopReasonString) =>
      localAPI.put<void>("jam/setStopReason", {
        query: { boutUuid, periodNum, jamNum },
        body: JSON.stringify(reason),
      }),
    ...options,
  });
