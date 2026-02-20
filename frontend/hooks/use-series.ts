import { getSeries, Series } from "@/lib/game/series";
import { QueryOptions, SuspenseQueryOptions } from "@/types/query";
import { useQuery, useSuspenseQuery } from "@tanstack/react-query";

// TODO: extract to separate file
export const useSuspenseSeries = (
  uuid: string,
  options?: Omit<SuspenseQueryOptions<Series>, "queryKey" | "queryFn">,
) =>
  useSuspenseQuery<Series>({
    queryKey: Series.generateKey(uuid),
    queryFn: () => getSeries(uuid),
    ...options,
  });

export const useSeries = <T = null>(
  uuid: string,
  options?: Omit<QueryOptions<Series | T>, "queryKey" | "queryFn">,
) =>
  useQuery({
    queryKey: Series.generateKey(uuid),
    queryFn: () => getSeries(uuid),
    ...options,
  });
