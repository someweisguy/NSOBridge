import { useSuspenseQuery } from "@tanstack/react-query";
import dispatch from "../app/client";
import { BoutIdType } from "../types/BoutIdType";
import { ClockType } from "../types/ClockType";
import { keyFactory } from "../utils/keyFactory";
import { useSocketState } from "../app/hooks/useConnection";

export default function useClock(boutId: BoutIdType, type: string): ClockType {
  const { latency } = useSocketState();
  const { data } = useSuspenseQuery<ClockType>({
    queryKey: keyFactory.clock(boutId, type),
    queryFn: () => dispatch("clock", "get", { boutId, type, latency }),
  });

  return data;
}
