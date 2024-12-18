import { useSuspenseQuery } from "@tanstack/react-query";
import { BoutType } from "../types/BoutType";
import { keyFactory } from "../utils/keyFactory";
import dispatch from "../app/client";

export default function useBout<T = BoutType>(boutId: string, selector?: (bout: BoutType) => T): T {
  const { data } = useSuspenseQuery<BoutType, unknown, T>({
    queryKey: keyFactory.bout(boutId),
    queryFn: () => dispatch("bout", "get", { boutId }),
    select: selector
  });

  return data;
}
