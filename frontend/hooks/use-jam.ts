import { Bout } from "@/lib/game/bouts";
import { useMutation, useSuspenseQuery } from "@tanstack/react-query";
import { getJam, Jam, TeamJam } from "../lib/game/jams";

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

export function useAddTrip(teamJam: TeamJam) {
  return useMutation({
    mutationFn: (passes: number) => teamJam.addTrip(passes),
  });
}

export function useSetLead(teamJam: TeamJam) {
  return useMutation({
    mutationFn: (lead: boolean) => teamJam.setLead(lead),
  });
}

export function useSetLost(teamJam: TeamJam) {
  return useMutation({
    mutationFn: (lost: boolean) => teamJam.setLost(lost),
  });
}

export function useSetStarPass(teamJam: TeamJam) {
  return useMutation({
    mutationFn: (starPass: boolean) => teamJam.setLost(starPass),
  });
}
