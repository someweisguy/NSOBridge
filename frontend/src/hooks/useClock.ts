import { useSuspenseQuery } from "@tanstack/react-query";
import dispatch from "../app/client";
import { BoutIdType } from "../types/BoutIdType";
import { ClockType } from "../types/ClockType";
import { keyFactory } from "../utils/keyFactory";
import { useSocketState } from "../app/hooks/useConnection";

export default function useClock<T = ClockType>(boutId: BoutIdType, type: string, selector?: (clock: ClockType) => T): T {
  const { latency } = useSocketState();
  const { data } = useSuspenseQuery<ClockType, unknown, T>({
    queryKey: keyFactory.clock(boutId, type),
    queryFn: () => dispatch("clock", "get", { boutId, type, latency }),
    select: selector
  });

  return data;
}
