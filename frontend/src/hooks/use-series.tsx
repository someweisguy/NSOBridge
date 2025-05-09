import { useSuspenseQuery } from "@tanstack/react-query";
import { keyFactory } from "../utils/key-factory";
import { getSeries } from "@/lib/client/api/series";


export default function useSeries() {
  const query = useSuspenseQuery({
    queryKey: keyFactory.series(),
    queryFn: getSeries,
  });

  return query.data;
}
