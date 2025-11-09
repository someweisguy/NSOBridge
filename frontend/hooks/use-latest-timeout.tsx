import { Bout } from "@/lib/game/bouts";
import { getTimeout, Timeout } from "@/lib/game/timeouts";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";

export default function useTimeout(bout: Bout, index: number): Timeout | null {
  const [queryKey, setQueryKey] = useState<
    ReturnType<typeof Timeout.generateKey>
  >(Timeout.generateKey(bout.id, index));

  useEffect(() => {
    setQueryKey(Timeout.generateKey(bout.id, index));
  }, [bout, index]);

  const { data } = useSuspenseQuery<Timeout | null>({
    queryKey,
    queryFn: () => getTimeout(queryKey),
  });

  return data;
}
