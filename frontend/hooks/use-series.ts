import { useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { getSeries, Series } from "../lib/game/series";

export const useSuspenseSeries = (index: number) =>
  useSuspenseQuery<Series[], unknown, Series>({
    queryKey: ["series", "all"],
    queryFn: () => getSeries(),
    select: (data: Series[]) => data[index],
  });

export const useSeries = (index: number) =>
  useQuery<Series[], unknown, Series>({
    queryKey: ["series", "all"],
    queryFn: () => getSeries(),
    select: (data: Series[]) => data[index],
  });
