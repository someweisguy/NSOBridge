import { Bout, getBout } from "@/lib/client/api/bout";
import { useSuspenseQuery } from "@tanstack/react-query";
import { keyFactory } from "../utils/key-factory";

export default function useBout(boutId: string): Bout {
  const { data } = useSuspenseQuery({
    queryKey: keyFactory.bout(boutId),
    queryFn: () => getBout(boutId),
  });

  return data;
}
