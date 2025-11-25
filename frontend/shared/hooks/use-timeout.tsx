import { Bout } from "@/shared/types/bouts";
import { Timeout } from "@/shared/types/timeouts";
import { useSuspenseQuery } from "@tanstack/react-query";
import { getTimeout } from "../lib/game/timeouts";

export default function useTimeout(bout: Bout, index: number): Timeout {
  const { data } = useSuspenseQuery<Timeout>({
    queryKey: Timeout.generateKey(bout.id, index),
    queryFn: () => getTimeout(bout.id, index),
  });

  return data;
}
