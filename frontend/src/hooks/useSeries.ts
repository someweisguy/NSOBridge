import dispatch from "../app/client";
import { useSuspenseQuery } from "@tanstack/react-query";

export function useSeries(): Map<string, object> {
  const { data } = useSuspenseQuery<Map<string, object>>({
    queryKey: ["series"],
    queryFn: () => dispatch("series", "get"),
    select: (data: object) => new Map(Object.entries(data)),
  });

  return data
}