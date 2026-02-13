import { getAllSeries, Series } from "@/lib/game/series";
import { SuspenseQueryOptions } from "@/types/query";
import { useSuspenseQuery } from "@tanstack/react-query";

export const useSuspenseAllSeries = (
  options?: SuspenseQueryOptions<Series[]>,
) =>
  useSuspenseQuery<Series[]>({
    queryKey: Series.generateKey(),
    queryFn: () => getAllSeries(),
    ...options,
  });
