import { localAPI } from "@/lib/requests";
import { TripEvent } from "@/types/jam";
import { AppMutationOptions } from "@/types/query";
import { useMutation } from "@tanstack/react-query";

type EditableTripEvent = Partial<Omit<TripEvent, "uuid">>;

/**
 * Update a TripEvent.
 *
 * @returns A Tanstack Mutation object which can fire the updateTripEvent
 * mutator.
 */
export const useUpdateTripEvent = (
  uuid: string,
  options?: AppMutationOptions<void, Error, EditableTripEvent>,
) =>
  useMutation({
    mutationFn: (tripEvent: EditableTripEvent) =>
      localAPI.put<void>("jam/tripEvent", {
        query: { uuid },
        body: tripEvent,
      }),
    ...options,
  });
