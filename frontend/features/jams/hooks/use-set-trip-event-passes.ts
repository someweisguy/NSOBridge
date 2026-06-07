import { localAPI } from "@/lib/requests";
import { AppMutationOptions, TripEventUri } from "@/types/query";
import { useMutation } from "@tanstack/react-query";

/**
 * Edit the number of passes in a Trip Event.
 *
 * @returns A Tanstack Mutation object which can fire the SetTripEventPasses
 * mutator.
 */
export const useSetTripEventPasses = ({
  boutUuid,
  periodNum,
  jamNum,
  teamNum,
  eventUuid,
  ...options
}: TripEventUri & AppMutationOptions<void, unknown, number>) =>
  useMutation({
    mutationFn: (passes: number) =>
      localAPI.put<void>("jam/setTripEventPasses", {
        query: {
          boutUuid,
          periodNum,
          jamNum,
          teamNum,
          eventUuid,
        },
        body: passes,
      }),
    ...options,
  });
