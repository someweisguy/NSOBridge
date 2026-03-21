import queryClient from "@/lib/cache";
import { Bout } from "@/lib/game/bouts";
import { localAPI } from "@/lib/requests";
import { AppSuspenseQueryOptions } from "@/types/query";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useCallback } from "react";

/**
 * Gets all the Bouts from the server. Each individual Bout is automatically cached
 * after it is fetched. This hook is a wrapper for call to TanStack Query's
 * `useSuspenseQuery` function.
 *
 * @returns a Tanstack useSuspenseQuery object containing an array of all Bouts.
 */
export const useSuspenseGetAllBouts = (
  options?: AppSuspenseQueryOptions<Partial<Bout>[]>,
) =>
  useSuspenseQuery<Partial<Bout>[], Error, Bout[]>(
    {
      queryKey: Bout.generateKey(),
      queryFn: () =>
        localAPI
          .get<Partial<Bout>[]>("bout/allBouts")
          .then((bouts: Partial<Bout>[]) => {
            for (const bout of bouts) {
              queryClient.setQueryData(Bout.generateKey(bout.uuid), bout);
            }
            return bouts;
          }),
      select: useCallback(
        (data: Partial<Bout>[]) =>
          data.map((bout) => Object.assign(new Bout(), bout)),
        [],
      ),
      ...options,
    },
    queryClient,
  );
