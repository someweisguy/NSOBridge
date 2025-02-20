import dispatchRequest from "../lib/client";
import { useSuspenseQuery } from "@tanstack/react-query";
import { keyFactory } from "../utils/key-factory";

export default function useSeries(): Map<string, object> {
  const { data } = useSuspenseQuery<Map<string, object>>({
    queryKey: keyFactory.series(),
    queryFn: () => dispatchRequest("series", "get"),
    select: (data: object) => new Map(Object.entries(data)),
  });

  return data;
}
