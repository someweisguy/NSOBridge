import { useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { getSeries, Series } from "../lib/game/series";

export const useSuspenseSeries = (uuid: string) =>
  useSuspenseQuery<Series[], unknown, Series>({
    queryKey: Series.generateKey(uuid),
    queryFn: () => getSeries(uuid),
  });

export const useSeries = (uuid: string) =>
  useQuery<Series[], unknown, Series>({
    queryKey: Series.generateKey(uuid),
    queryFn: () => getSeries(uuid),
  });
