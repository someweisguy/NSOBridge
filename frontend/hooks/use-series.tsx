import { Series } from "@/types/series";
import { useSuspenseQuery } from "@tanstack/react-query";
import { getSeries } from "../lib/game/series";

export default function useSeries(key: number): Series {
  const { data } = useSuspenseQuery<Series>({
    queryKey: ["series", key],
    queryFn: () => getSeries(key),
  });

  return data;
}
