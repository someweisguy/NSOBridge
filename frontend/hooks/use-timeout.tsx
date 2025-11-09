import { Bout } from "@/lib/game/bouts";
import { getTimeout, Timeout } from "@/lib/game/timeouts";
import { useSuspenseQuery } from "@tanstack/react-query";

export default function useTimeout(bout: Bout, index: number): Timeout {
  const queryKey = Timeout.generateKey(bout.id, index);
  const { data } = useSuspenseQuery<Timeout>({
    queryKey,
    queryFn: () => getTimeout(queryKey),
  });

  return data;
}
