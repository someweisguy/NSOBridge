import { getTimeout } from "@/lib/game/timeouts";
import { Bout, Timeout } from "@/types/game";
import { useSuspenseQuery } from "@tanstack/react-query";

export default function useTimeout(bout: Bout, index: number): Timeout {
  const { data } = useSuspenseQuery<Timeout>({
    queryKey: Timeout.generateKey(bout.id, index),
    queryFn: () => getTimeout(bout.id, index),
  });

  return data;
}
