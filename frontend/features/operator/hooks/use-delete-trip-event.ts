import { localAPI } from "@/lib/requests";
import { AppMutationOptions } from "@/types/query";
import { useMutation } from "@tanstack/react-query";

export interface UseDeleteTripProps extends AppMutationOptions<
  void,
  unknown,
  void
> {
  uuid: string;
}

/**
 * Set the number of passes in a given Trip.
 *
 * @returns A Tanstack Mutation object which can fire the useSetJamTripPasses
 * mutator.
 */
export const useDeleteTripEvent = ({ uuid, ...options }: UseDeleteTripProps) =>
  useMutation({
    mutationFn: () =>
      localAPI.delete<void>("jam/tripEvent", {
        query: { uuid },
      }),
    ...options,
  });
