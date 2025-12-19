import { Bout, getBout } from "@/lib/game/bouts";
import { useMutation, useSuspenseQuery } from "@tanstack/react-query";
import useJam from "./use-jam";
import { Jam } from "@/lib/game/jams";

export default function useBout(key: number): Bout {
  const { data } = useSuspenseQuery<Bout>({
    queryKey: Bout.generateKey(key),
    queryFn: () => getBout(key),
  });

  return data;
}

export function useBeginPeriod(bout: Bout) {
  return useMutation({
    mutationFn: () => bout.beginPeriod(),
  });
}

export function useEndPeriod(bout: Bout) {
  return useMutation({
    mutationFn: () => bout.endPeriod(),
  });
}

export function useStartJam(bout: Bout) {
  return useMutation({
    mutationFn: () => bout.startJam(),
  });
}

export function useStopJam(bout: Bout) {
  return useMutation({
    mutationFn: () => bout.stopJam(),
  });
}

export function useStartTimeout(bout: Bout) {
  return useMutation({
    mutationFn: () => bout.startTimeout(),
  });
}

export function useStopTimeout(bout: Bout) {
  return useMutation({
    mutationFn: () => bout.stopTimeout(),
  });
}

export function useActiveJam(bout: Bout): Jam {
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
}
