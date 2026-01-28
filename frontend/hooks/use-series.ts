import { useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { getAllSeries, getSeries, Series } from "@/lib/game/series";

export const useSuspenseAllSeries = () =>
  useSuspenseQuery<Series[]>({
    queryKey: Series.generateKey(),
    queryFn: () => getAllSeries(),
  });

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
