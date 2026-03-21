import queryClient from "@/lib/cache";
import { localAPI } from "@/lib/requests";
import { AppSuspenseQueryOptions } from "@/types/query";
import { Series } from "@/types/series";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useCallback } from "react";

/**
 * Gets all the Series from the server. Each individual Series is automatically cached
 * after it is fetched. This hook is a wrapper for call to TanStack Query's
 * `useSuspenseQuery` function.
 *
 * @returns a Tanstack useSuspenseQuery object containing an array of all Series.
 */
export const useSuspenseGetAllSeries = (
  options?: AppSuspenseQueryOptions<Partial<Series>[]>,
) =>
  useSuspenseQuery({
    queryKey: Series.generateKey(),
    queryFn: () =>
      localAPI
        .get<Partial<Series>[]>("series/allSeries")
        .then<Partial<Series>[]>((allSeries: Partial<Series>[]) => {
          for (const series of allSeries) {
            queryClient.setQueryData(Series.generateKey(series.uuid), series);
          }
          return allSeries;
        }),
    select: useCallback(
      (allSeries: Partial<Series>[]) =>
        allSeries.map((series) => Object.assign(new Series(), series)),
      [],
    ),
    ...options,
  });
