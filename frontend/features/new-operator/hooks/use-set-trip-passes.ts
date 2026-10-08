import { localAPI } from "@/lib/requests";
import { AppMutationOptions } from "@/types/query";
import { useMutation } from "@tanstack/react-query";

export interface UseSetTripPassesProps extends AppMutationOptions<
  void,
  unknown,
  number
> {
  tripEventUuid: string;
}

/**
 * Set the number of passes in a given Trip.
 *
 * @returns A Tanstack Mutation object which can fire the useSetJamTripPasses
 * mutator.
 */
export const useSetJamTripPasses = ({
  tripEventUuid,
  ...options
}: UseSetTripPassesProps) =>
  useMutation({
    mutationFn: (passes: number) =>
      localAPI.put<void>("jam/trip/passes", {
        query: { tripEventUuid },
        body: passes,
      }),
    ...options,
  });
