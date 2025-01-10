import dispatch from "../app/client";
import { useSuspenseQuery } from "@tanstack/react-query";
import { keyFactory } from "../utils/keyFactory";

export default function useSeries(): Map<string, object> {
  const { data } = useSuspenseQuery<Map<string, object>>({
    queryKey: keyFactory.series(),
    queryFn: () => dispatch("series", "get"),
    select: (data: object) => new Map(Object.entries(data)),
  });

  return data;
}
