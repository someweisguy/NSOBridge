import { Bout } from "@/lib/game/bouts";
import { Jam } from "@/types/game";
import { useSuspenseQuery } from "@tanstack/react-query";
import { getJam } from "../lib/game/jams";

export default function useJam(
  bout: Bout,
  periodNum: number,
  jamNum: number,
): Jam {
  const { data } = useSuspenseQuery<Jam>({
    queryKey: Jam.generateKey(bout.id, periodNum, jamNum),
    queryFn: () => getJam(bout.id, periodNum, jamNum),
  });

  return data;
}
