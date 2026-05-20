import queryClient from "@/lib/cache";
import { localAPI } from "@/lib/requests";
import { Bout } from "@/types/bout";
import { AppQueryOptions } from "@/types/query";
import { generateQueryKey } from "@/utils/query";
import { useQuery } from "@tanstack/react-query";

/**
 * Gets all the Bouts from the server. Each individual Bout is automatically cached
 * after it is fetched. This hook is a wrapper for call to TanStack Query's `useQuery`
 * function.
 *
 * @returns a Tanstack useQuery object containing an array of all Bouts.
 */
export const useGetAllBouts = (options?: AppQueryOptions<Bout[]>) =>
  useQuery<Bout[]>(
    {
      queryKey: generateQueryKey.bout(),
      queryFn: () =>
        localAPI.get<Bout[]>("bout/allBouts").then((bouts) => {
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
