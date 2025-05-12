import { Bout, getBout } from "@/lib/client/api/bout";
import { useSuspenseQuery } from "@tanstack/react-query";
import { keyFactory } from "../utils/key-factory";

export default function useBout<T = Bout>(
  boutId: string,
  select?: (data: Bout) => T
): T {
  const { data } = useSuspenseQuery({
    queryKey: keyFactory.bout(boutId),
    queryFn: () => getBout(boutId),
    select,
  });

  return data;
}
