import queryClient from "@/lib/cache";
import { localAPI } from "@/lib/requests";
import { AppSuspenseQueryOptions } from "@/types/query";
import { Series } from "@/types/series";
import { generateQueryKey } from "@/utils/query";
import { useSuspenseQuery } from "@tanstack/react-query";

/**
 * Gets all the Series from the server. Each individual Series is automatically cached
 * after it is fetched. This hook is a wrapper for call to TanStack Query's
 * `useSuspenseQuery` function.
 *
 * @returns a Tanstack useSuspenseQuery object containing an array of all Series.
 */
export const useSuspenseGetAllSeries = <T = Series[]>(
  options?: AppSuspenseQueryOptions<Series[], T>,
) =>
  useSuspenseQuery({
    queryKey: generateQueryKey.series("ALL"),
    queryFn: () =>
      localAPI
        .get<Series[]>("series/allSeries")
        .then<Series[]>((allSeries: Series[]) => {
          for (const series of allSeries) {
            if (series.uuid != null) {
              queryClient.setQueryData(
                generateQueryKey.series(series.uuid),
                series,
              );
            }
          }
          return allSeries;
        }),
    ...options,
  });
