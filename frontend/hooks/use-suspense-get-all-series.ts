import queryClient from "@/lib/cache";
import { getAllSeries } from "@/lib/game/series";
import { AppSuspenseQueryOptions } from "@/types/query";
import { Series } from "@/types/series";
import { useSuspenseQuery } from "@tanstack/react-query";

/**
 * Gets all the Series from the server. Each individual Series is automatically cached
 * after it is fetched. This hook is a wrapper for call to TanStack Query's
 * `useSuspenseQuery` function.
 *
 * @returns a Tanstack useSuspenseQuery object containing an array of all Series.
 */
export const useSuspenseGetAllSeries = (
  options?: AppSuspenseQueryOptions<Series[]>,
) =>
  useSuspenseQuery<Series[]>({
    queryKey: Series.generateKey(),
    queryFn: () =>
      getAllSeries().then((allSeries: Series[]) => {
        for (const series of allSeries) {
          queryClient.setQueryData(Series.generateKey(series.uuid), series);
        }
        return allSeries;
      }),
    ...options,
  });
