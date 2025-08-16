import { Bout, BoutContext, getBoutContext } from "@/lib/bout";
import { useSuspenseQuery } from "@tanstack/react-query";

export default function useBoutContext(key: number): BoutContext {
  const { data } = useSuspenseQuery<BoutContext>({
    queryKey: [Bout.generateKey(key), "context"],
    queryFn: () => getBoutContext(key),
  });

  return data;
}
