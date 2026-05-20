import queryClient from "@/lib/cache";
import { localAPI } from "@/lib/requests";
import { Bout } from "@/types/bout";
import { AppSuspenseQueryOptions } from "@/types/query";
import { generateQueryKey } from "@/utils/query";
import { useSuspenseQuery } from "@tanstack/react-query";

/**
 * Gets all the Bouts from the server. Each individual Bout is automatically cached
 * after it is fetched. This hook is a wrapper for call to TanStack Query's
 * `useSuspenseQuery` function.
 *
 * @returns a Tanstack useSuspenseQuery object containing an array of all Bouts.
 */
export const useSuspenseGetAllBouts = <T = Bout[]>(
  options?: AppSuspenseQueryOptions<Bout[], T>,
) =>
  useSuspenseQuery<Bout[], Error, T>(
    {
      queryKey: generateQueryKey.bout(),
      queryFn: () =>
        localAPI.get<Bout[]>("bout/allBouts").then((bouts: Bout[]) => {
          for (const bout of bouts) {
            if (bout.uuid != null) {
              queryClient.setQueryData(generateQueryKey.bout(bout.uuid), bout);
            }
          }
          return bouts;
        }),
      ...options,
    },
    queryClient,
  );
