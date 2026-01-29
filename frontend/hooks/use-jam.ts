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

export const useAddTrip = (jam: Jam, teamJam: TeamJam) =>
  useMutation({
    mutationFn: (passes: number) => jam.addTrip(teamJam, passes),
  });

export const useSetLead = (jam: Jam, teamJam: TeamJam) =>
  useMutation({
    mutationFn: (lead: boolean) => jam.setLead(teamJam, lead),
  });

export const useSetLost = (jam: Jam, teamJam: TeamJam) =>
  useMutation({
    mutationFn: (lost: boolean) => jam.setLost(teamJam, lost),
  });

export const useSetStarPass = (jam: Jam, teamJam: TeamJam) =>
  useMutation({
    mutationFn: (starPass: boolean) => jam.setStarPass(teamJam, starPass),
  });
