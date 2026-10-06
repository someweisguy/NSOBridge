import { localAPI } from "@/lib/requests";
import { StopReasonString } from "@/types/jam";
import { AppMutationOptions } from "@/types/query";
import { useMutation } from "@tanstack/react-query";

export interface UseSetJamStopReasonProps extends AppMutationOptions<
  void,
  Error,
  StopReasonString
> {
  jamUuid: string;
}

/**
 * Set the stop reason of the desired Jam.
 *
 * @returns A Tanstack Mutation object which can fire the useSetJamStopReason mutator.
 */
export const useSetJamStopReason = ({
  jamUuid,
  ...options
}: UseSetJamStopReasonProps) =>
  useMutation({
    mutationFn: (reason: StopReasonString) =>
      localAPI.put<void>("jam/setStopReason", {
        query: { jamUuid },
        body: JSON.stringify(reason),
      }),
    ...options,
  });
