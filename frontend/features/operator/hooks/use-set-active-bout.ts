import { localAPI } from "@/lib/requests";
import { AppMutationOptions } from "@/types/query";
import { useMutation } from "@tanstack/react-query";

/**
 * Set the active Bout of the desired Series.
 *
 * @returns A Tanstack Mutation object which can fire the SetActiveBout mutator.
 */
export const useSetActiveBout = ({
  seriesUuid,
  ...options
}: { seriesUuid: string } & AppMutationOptions<void, Error, string>) =>
  useMutation({
    mutationFn: (boutUuid: string) =>
      localAPI.put<void>("series/activeBout", {
        query: { seriesUuid },
        body: JSON.stringify(boutUuid),
      }),
    ...options,
  });
