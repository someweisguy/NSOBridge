import { getSeries, Series } from "@/shared/features/game/series/types";
import { useSuspenseQuery } from "@tanstack/react-query";

export default function useSeries(key: number): Series {
  const { data } = useSuspenseQuery<Series>({
    queryKey: ["series", key],
    queryFn: () => getSeries(key),
  });

  return data;
}
