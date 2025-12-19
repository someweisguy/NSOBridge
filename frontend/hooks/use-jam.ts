import { Bout } from "@/lib/game/bouts";
import { useMutation, useSuspenseQuery } from "@tanstack/react-query";
import { getJam, Jam, TeamJam } from "../lib/game/jams";

export const useJam = (bout: Bout, periodNum: number, jamNum: number) =>
  useSuspenseQuery<Jam>({
    queryKey: Jam.generateKey(bout.id, periodNum, jamNum),
    queryFn: () => getJam(bout.id, periodNum, jamNum),
  });

export const useAddTrip = (teamJam: TeamJam) =>
  useMutation({
    mutationFn: (passes: number) => teamJam.addTrip(passes),
  });

export const useSetLead = (teamJam: TeamJam) =>
  useMutation({
    mutationFn: (lead: boolean) => teamJam.setLead(lead),
  });

export const useSetLost = (teamJam: TeamJam) =>
  useMutation({
    mutationFn: (lost: boolean) => teamJam.setLost(lost),
  });

export const useSetStarPass = (teamJam: TeamJam) =>
  useMutation({
    mutationFn: (starPass: boolean) => teamJam.setLost(starPass),
  });
