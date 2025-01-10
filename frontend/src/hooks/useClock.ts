import { useSuspenseQuery } from "@tanstack/react-query";
import dispatch from "../app/client";
import { ClockType } from "../types/ClockType";
import { keyFactory } from "../utils/keyFactory";
import { useSocketState } from "../app/hooks/useConnection";
import { BoutIdType } from "../types/bout";

export default function useClock<T = ClockType>(
  boutId: BoutIdType,
  type: string,
  selector?: (clock: ClockType) => T
): T {
  const { latency } = useSocketState();
  const { data } = useSuspenseQuery<ClockType, unknown, T>({
    queryKey: keyFactory.clock(boutId, type),
    queryFn: () => dispatch("clock", "get", { boutId, type, latency }),
    select: selector,
  });

  return data;
}
