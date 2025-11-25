import { Bout, BoutContext } from "@/types/bouts";
import { useSuspenseQuery } from "@tanstack/react-query";
import { getBoutContext } from "../lib/game/bouts";

export default function useBoutContext(key: number): BoutContext {
  const { data } = useSuspenseQuery<BoutContext>({
    queryKey: Bout.generateKey(key).concat("context"),
    queryFn: () => getBoutContext(key),
  });

  return data;
}
