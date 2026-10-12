import { localAPI } from "@/lib/requests";
import { AppMutationOptions } from "@/types/query";
import { useMutation } from "@tanstack/react-query";

interface EditableBoutClock {
  isRunning?: boolean;
  remaining?: number;
}

/**
 * Update the Bout clock.
 *
 * @returns A Tanstack Mutation object which can fire the updateBoutClock mutator.
 */
export const useUpdateBoutClock = (
  uuid: string,
  options?: AppMutationOptions<void, Error, EditableBoutClock>,
) =>
  useMutation({
    mutationFn: (boutClock: EditableBoutClock) =>
      localAPI.put<void>("bout/clock", {
        query: { uuid },
        body: boutClock,
      }),
    ...options,
  });
