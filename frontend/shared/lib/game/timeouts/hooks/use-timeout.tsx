import { Bout } from "@/shared/lib/game/bouts/types";
import { getTimeout, Timeout } from "@/shared/lib/game/timeouts/types";
import { useSuspenseQuery } from "@tanstack/react-query";

export default function useTimeout(bout: Bout, index: number): Timeout | null {
  const queryKey = Timeout.generateKey(bout.id, index);
  const { data } = useSuspenseQuery<Timeout | null>({
    queryKey,
    queryFn: () => getTimeout(queryKey),
  });

  return data;
}
