import { Bout, BoutContext, getBoutContext } from "@/features/game/bouts/types";
import { useSuspenseQuery } from "@tanstack/react-query";

export default function useBoutContext(key: number): BoutContext {
  const { data } = useSuspenseQuery<BoutContext>({
    queryKey: Bout.generateKey(key).concat("context"),
    queryFn: () => getBoutContext(key),
  });

  return data;
}
