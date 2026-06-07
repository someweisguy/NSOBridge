import { localAPI } from "@/lib/requests";
import { AppMutationOptions, TripEventUri } from "@/types/query";
import { useMutation } from "@tanstack/react-query";

/**
 * Delete a Trip Event.
 *
 * @returns A Tanstack Mutation object which can fire the DeleteTripEvent
 * mutator.
 */
export const useDeleteTripEvent = ({
  boutUuid,
  periodNum,
  jamNum,
  teamNum,
  eventNum,
  ...options
}: TripEventUri & AppMutationOptions<void, unknown, void>) =>
  useMutation({
    mutationFn: () =>
      localAPI.delete<void>("jam/tripEvent", {
        query: {
          boutUuid,
          periodNum,
          jamNum,
          teamNum,
          eventNum,
        },
      }),
    ...options,
  });
