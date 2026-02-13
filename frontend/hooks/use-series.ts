import { getSeries, Series } from "@/lib/game/series";
import { useQuery, useSuspenseQuery } from "@tanstack/react-query";

export const useSuspenseSeries = (uuid: string) =>
  useSuspenseQuery<Series>({
    queryKey: Series.generateKey(uuid),
    queryFn: () => getSeries(uuid),
  });

export const useSeries = (uuid: string) =>
  useQuery<Series>({
    queryKey: Series.generateKey(uuid),
    queryFn: () => getSeries(uuid),
  });
