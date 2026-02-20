import { getSeries, Series } from "@/lib/game/series";
import { SuspenseQueryOptions } from "@/types/query";
import { useSuspenseQuery } from "@tanstack/react-query";

export const useSuspenseSeries = (
  uuid: string,
  options?: Omit<SuspenseQueryOptions<Series>, "queryKey" | "queryFn">,
) =>
  useSuspenseQuery<Series>({
    queryKey: Series.generateKey(uuid),
    queryFn: () => getSeries(uuid),
    ...options,
  });
