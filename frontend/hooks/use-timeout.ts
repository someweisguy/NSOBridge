import { getTimeout } from "@/lib/game/timeouts";
import { Timeout } from "@/types/game";
import { useSuspenseQuery } from "@tanstack/react-query";

export default function useTimeout(
  boutId: number,
  index: number,
): Timeout | null {
  const { data } = useSuspenseQuery<Timeout | null>({
    queryKey: Timeout.generateKey(boutId, index),
    queryFn: () => getTimeout(boutId, index),
  });

  return data;
}
