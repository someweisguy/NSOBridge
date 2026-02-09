import { Bout } from "@/lib/game/bouts";
import { getJam, Jam, TeamJam } from "@/lib/game/jams";
import {
  useMutation,
  useQuery,
  UseQueryOptions,
  useSuspenseQuery,
  UseSuspenseQueryOptions,
} from "@tanstack/react-query";

export const useSuspenseJam = (
  bout: Bout,
  periodNum: number,
  jamNum: number,
  options?: Omit<UseSuspenseQueryOptions<Jam>, "queryKey" | "queryFn">,
) =>
  useSuspenseQuery<Jam>({
    queryKey: Jam.generateKey(bout.uuid, periodNum, jamNum),
    queryFn: () => getJam(bout.uuid, periodNum, jamNum),
    ...options,
  });

export const useJam = <T = null>(
  bout: Bout,
  periodNum: number,
  jamNum: number,
  options?: Omit<UseQueryOptions<Jam | T>, "queryKey" | "queryFn">,
) =>
  useQuery<Jam | T>({
    queryKey: Jam.generateKey(bout.uuid, periodNum, jamNum),
    queryFn: () => getJam(bout.uuid, periodNum, jamNum),
    ...options,
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
