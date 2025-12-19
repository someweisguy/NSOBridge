import { Bout, createBout, getBout } from "@/lib/game/bouts";
import { Jam } from "@/lib/game/jams";
import { useMutation, useSuspenseQuery } from "@tanstack/react-query";
import useJam from "./use-jam";

export default function useBout(key: number): Bout {
  const { data } = useSuspenseQuery<Bout>({
    queryKey: Bout.generateKey(key),
    queryFn: () => getBout(key),
  });

  return data;
}

// TODO: add ruleset parameter to this hook
export const useCreateBout = () =>
  useMutation({
    mutationFn: (rosterIds: number[]) => createBout(rosterIds),
  });

export const useBeginPeriod = (bout: Bout) =>
  useMutation({
    mutationFn: () => bout.beginPeriod(),
  });

export const useEndPeriod = (bout: Bout) =>
  useMutation({
    mutationFn: () => bout.endPeriod(),
  });

export const useStartJam = (bout: Bout) =>
  useMutation({
    mutationFn: () => bout.startJam(),
  });

export const useStopJam = (bout: Bout) =>
  useMutation({
    mutationFn: () => bout.stopJam(),
  });

export const useStartTimeout = (bout: Bout) =>
  useMutation({
    mutationFn: () => bout.startTimeout(),
  });

export const useStopTimeout = (bout: Bout) =>
  useMutation({
    mutationFn: () => bout.stopTimeout(),
  });

export const useActiveJam = (bout: Bout): Jam => {
  let currentPeriodNum = bout.jamCounts.indexOf(0);
  if (currentPeriodNum < 0) {
    currentPeriodNum = bout.jamCounts.length;
  }
  currentPeriodNum--;
  let currentJamNum = bout.jamCounts[currentPeriodNum] - 1;
  if (["lineup", "timeout"].includes(bout.state) && currentJamNum > 0) {
    currentJamNum--;
  }

  return useJam(bout, currentPeriodNum, currentJamNum);
};
