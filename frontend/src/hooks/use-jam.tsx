import { getJam } from "@/lib/client/api/jam";
import { Jam } from "@/lib/client/api/types";
import { useSuspenseQuery } from "@tanstack/react-query";
import { keyFactory } from "../utils/key-factory";

export default function useJam(
  boutId: string,
  periodNum: number,
  jamNum: number
): Jam {
  const { data } = useSuspenseQuery({
    queryKey: keyFactory.jam(boutId, periodNum, jamNum),
    queryFn: () => getJam(boutId, periodNum, jamNum),
  });

  return data;
}
