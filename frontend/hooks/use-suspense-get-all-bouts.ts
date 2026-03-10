import queryClient from "@/lib/cache";
import { Bout, getAllBouts } from "@/lib/game/bouts";
import { SuspenseQueryOptions } from "@/types/query";
import { useSuspenseQuery } from "@tanstack/react-query";

/**
 * Gets all the Bouts from the server. Each individual Bout is automatically cached
 * after it is fetched. This hook is a wrapper for call to TanStack Query's
 * `useSuspenseQuery` function.
 *
 * @returns a Tanstack useSuspenseQuery object containing an array of all Bouts.
 */
export const useSuspenseGetAllBouts = (
  options?: Omit<SuspenseQueryOptions<Bout[]>, "queryKey" | "queryFn">,
) =>
  useSuspenseQuery(
    {
      queryKey: Bout.generateKey(),
      queryFn: () =>
        getAllBouts().then((bouts: Bout[]) => {
          for (const bout of bouts) {
            queryClient.setQueryData(Bout.generateKey(bout.uuid), bout);
          }
          return bouts;
        }),
      ...options,
    },
    queryClient,
  );
