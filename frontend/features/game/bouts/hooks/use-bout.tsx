import { Bout, getBout } from "@/lib/game/bouts";
import { useSuspenseQuery } from "@tanstack/react-query";

export default function useBout(key: number): Bout {
  const { data } = useSuspenseQuery<Bout>({
    queryKey: Bout.generateKey(key),
    queryFn: () => getBout(key),
  });

  return data;
}
