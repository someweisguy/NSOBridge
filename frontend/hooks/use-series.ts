import { useSuspenseQuery } from "@tanstack/react-query";
import { getSeries, Series } from "../lib/game/series";

export const useSeries = (key: number) =>
  useSuspenseQuery<Series>({
    queryKey: ["series", key],
    queryFn: () => getSeries(key),
  });
