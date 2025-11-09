import { Bout } from "@/features/game/bouts/types";
import { getJam, Jam } from "@/features/game/jams/types";
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
