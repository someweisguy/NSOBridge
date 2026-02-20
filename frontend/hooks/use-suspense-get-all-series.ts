import { getAllSeries, Series } from "@/lib/game/series";
import { SuspenseQueryOptions } from "@/types/query";
import { useSuspenseQuery } from "@tanstack/react-query";

export const useSuspenseGetAllSeries = (
  options?: Omit<SuspenseQueryOptions<Series[]>, "queryKey" | "queryFn">,
) =>
  useSuspenseQuery<Series[]>({
    queryKey: Series.generateKey(),
    queryFn: () => getAllSeries(),
    ...options,
  });
