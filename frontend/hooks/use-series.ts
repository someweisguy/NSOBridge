import queryClient from "@/lib/cache";
import { localAPI } from "@/lib/requests";
import {
  AppQueryOptions,
  AppSuspenseQueryOptions,
  SeriesUri,
} from "@/types/query";
import { Series } from "@/types/series";
import { seriesKeys } from "@/utils/query-keys";
import {
  useQuery,
  UseQueryResult,
  useSuspenseQuery,
} from "@tanstack/react-query";

/**
 * Gets all the Series from the server. Each individual Series is automatically cached
 * after it is fetched. This hook is a wrapper for call to TanStack Query's
 * `useSuspenseQuery` function.
 *
 * @returns a Tanstack useSuspenseQuery object containing an array of all Series.
 */
export const useSuspenseSeries = <T = Series>({
  seriesUuid,
  ...options
}: SeriesUri & AppSuspenseQueryOptions<Series, T>) =>
  useSuspenseQuery({
    queryKey: seriesKeys.one(seriesUuid),
    queryFn: () => localAPI.get<Series>("series", { query: { seriesUuid } }),
    ...options,
  });

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
    queryKey: seriesKeys.all,
    queryFn: () =>
      localAPI
        .get<Series[]>("series/allSeries")
        .then<Series[]>((allSeries: Series[]) => {
          for (const series of allSeries) {
            if (series.uuid != null) {
              queryClient.setQueryData(seriesKeys.one(series.uuid), series);
            }
          }
          return allSeries;
        }),
    ...options,
  });

/**
 * Gets all the Series from the server. Each individual Series is automatically cached
 * after it is fetched. This hook is a wrapper for call to TanStack Query's
 * `useQuery` function.
 *
 * @returns a Tanstack useQuery object containing an array of all Series.
 */
export const useGetAllSeries = <T = Series[]>(
  options?: AppQueryOptions<Series[], T>,
): UseQueryResult<T, Error> =>
  useQuery({
    queryKey: seriesKeys.all,
    queryFn: () =>
      localAPI
        .get<Series[]>("series/allSeries")
        .then<Series[]>((allSeries: Series[]) => {
          for (const series of allSeries) {
            if (series.uuid != null) {
              queryClient.setQueryData(seriesKeys.one(series.uuid), series);
            }
          }
          return allSeries;
        }),
    ...options,
  });
