import queryClient from "@/lib/cache";
import { Bout, getAllBouts } from "@/lib/game/bouts";
import { QueryOptions } from "@/types/query";
import { useQuery } from "@tanstack/react-query";

/**
 * Gets all the Bouts from the server. Each individual Bout is automatically cached
 * after it is fetched. This hook is a wrapper for call to TanStack Query's `useQuery`
 * function.
 *
 * @returns a Tanstack useQuery object containing an array of all Bouts.
 */
export const useGetAllBouts = (
  options?: Omit<QueryOptions<Bout[]>, "queryKey" | "queryFn">,
) =>
  useQuery(
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
