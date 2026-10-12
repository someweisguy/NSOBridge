import { localAPI } from "@/lib/requests";
import { Jam } from "@/types/jam";
import { AppMutationOptions } from "@/types/query";
import { useMutation } from "@tanstack/react-query";

type EditableJam = Partial<Omit<Jam, "uuid">>;

/**
 * Update the Jam.
 *
 * @returns A Tanstack Mutation object which can fire the updateJam mutator.
 */
export const useUpdateJam = (
  uuid: string,
  options?: AppMutationOptions<void, Error, EditableJam>,
) =>
  useMutation({
    mutationFn: (jam: EditableJam) =>
      localAPI.put<void>("jam", {
        query: { uuid },
        body: jam,
      }),
    ...options,
  });
