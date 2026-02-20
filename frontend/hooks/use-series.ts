import { getSeries, Series } from "@/lib/game/series";
import { QueryOptions } from "@/types/query";
import { useQuery } from "@tanstack/react-query";

export const useSeries = <T = null>(
  uuid: string,
  options?: Omit<QueryOptions<Series | T>, "queryKey" | "queryFn">,
) =>
  useQuery({
    queryKey: Series.generateKey(uuid),
    queryFn: () => getSeries(uuid),
    ...options,
  });
