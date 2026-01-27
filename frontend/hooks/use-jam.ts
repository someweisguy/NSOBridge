import { Bout } from "@/lib/game/bouts";
import { getJam, Jam, TeamJam } from "@/lib/game/jams";
import { useMutation, useQuery, useSuspenseQuery } from "@tanstack/react-query";

export const useSuspenseJam = (bout: Bout, periodNum: number, jamNum: number) =>
  useSuspenseQuery<Jam>({
    queryKey: Jam.generateKey(bout.uuid, periodNum, jamNum),
    queryFn: () => getJam(bout.uuid, periodNum, jamNum),
  });

export const useJam = (bout: Bout, periodNum: number, jamNum: number) =>
  useQuery<Jam>({
    queryKey: Jam.generateKey(bout.uuid, periodNum, jamNum),
    queryFn: () => getJam(bout.uuid, periodNum, jamNum),
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
    mutationFn: (starPass: boolean) => teamJam.setStarPass(starPass),
  });
