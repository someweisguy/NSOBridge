import { useSuspenseQuery } from "@tanstack/react-query";
import dispatch from "../app/client";
import { ClockType } from "../types/clock";
import { keyFactory } from "../utils/keyFactory";
import { useConnection } from "./useConnection";
import { BoutIdType } from "../types/bout";

export default function useClock<T = ClockType>(
  boutId: BoutIdType,
  type: string,
  selector?: (clock: ClockType) => T
): T {
  const { latency } = useConnection();
  const { data } = useSuspenseQuery<ClockType, unknown, T>({
    queryKey: keyFactory.clock(boutId, type),
    queryFn: () => dispatch("clock", "get", { boutId, type, latency }),
    select: selector,
  });

  return data;
}
