import { localAPI } from "@/lib/requests";
import { AppMutationOptions } from "@/types/query";
import { Timeout } from "@/types/timeout";
import { useMutation } from "@tanstack/react-query";

type EditableTimeout = Partial<Omit<Timeout, "uuid">>;

/**
 * Update the Timeout.
 *
 * @returns A Tanstack Mutation object which can fire the updateTimeout mutator.
 */
export const useUpdateTimeout = (
  uuid: string,
  options?: AppMutationOptions<void, Error, EditableTimeout>,
) =>
  useMutation({
    mutationFn: (timeout: EditableTimeout) =>
      localAPI.put<void>("timeout", {
        query: { uuid },
        body: timeout,
      }),
    ...options,
  });
