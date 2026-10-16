import { localAPI } from "@/lib/requests";
import { TripEvent } from "@/types/jam";
import { AppMutationOptions } from "@/types/query";
import { useMutation } from "@tanstack/react-query";

type EditableTripEvent = Partial<Omit<TripEvent, "uuid">>;

interface UseUpdateTripEventOptions extends AppMutationOptions<
  void,
  Error,
  EditableTripEvent
> {
  uuid: string;
}

/**
 * Update a TripEvent.
 *
 * This hook does not trigger any rule-based side effects.
 *
 * @returns A Tanstack Mutation object which can fire the updateTripEvent
 * mutator.
 */
export const useUpdateTripEvent = ({
  uuid,
  ...options
}: UseUpdateTripEventOptions) =>
  useMutation({
    mutationFn: (tripEvent: EditableTripEvent) =>
      localAPI.put<void>("jam/tripEvent", {
        query: { uuid },
        body: tripEvent,
      }),
    ...options,
  });
