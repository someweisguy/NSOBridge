import { localAPI } from "@/lib/requests";
import { Jam, StopReasonString } from "@/types/jam";
import { AppMutationOptions } from "@/types/query";
import { useMutation } from "@tanstack/react-query";

export interface UseUpdateJamStopReasonProps extends AppMutationOptions<
  void,
  Error,
  StopReasonString
> {
  jam: Jam;
}

/**
 * Set the stop reason of the desired Jam.
 *
 * @returns A Tanstack Mutation object which can fire the useSetJamStopReason mutator.
 */
export const useUpdateJamStopReason = ({
  jam,
  ...options
}: UseUpdateJamStopReasonProps) =>
  useMutation({
    mutationFn: (reason: StopReasonString) =>
      localAPI.put<void>("jam/stopReason", {
        query: { uuid: jam.uuid },
        body: JSON.stringify(reason),
      }),
    ...options,
  });
