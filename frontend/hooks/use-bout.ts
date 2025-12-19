import { useSuspenseQuery } from "@tanstack/react-query";
import { Bout, getBout } from "@/lib/game/bouts";

export default function useBout(key: number): Bout {
  const { data } = useSuspenseQuery<Bout>({
    queryKey: Bout.generateKey(key),
    queryFn: () => getBout(key),
  });

  return data;
}
