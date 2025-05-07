import { useSuspenseQuery } from "@tanstack/react-query";
import { keyFactory } from "../utils/key-factory";
import { getSeries, Series } from "@/lib/client/api/series";

export default function useSeries(): Series {
  const { data } = useSuspenseQuery({
    queryKey: keyFactory.series(),
    queryFn: getSeries,
  });

  return data;
}
