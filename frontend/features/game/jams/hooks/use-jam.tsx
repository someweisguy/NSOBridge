import { Bout } from "@/lib/game/bouts";
import { getJam, Jam } from "@/lib/game/jams";
import { useSuspenseQuery } from "@tanstack/react-query";

export default function useJam(
  bout: Bout,
  periodNum: number,
  jamNum: number,
): Jam | null {
  const queryKey = Jam.generateKey(bout.id, periodNum, jamNum);

  const { data } = useSuspenseQuery<Jam | null>({
    queryKey,
    queryFn: () => getJam(queryKey),
  });

  return data;
}
