import { Bout, createBout, getBout } from "@/lib/game/bouts";
import { Series } from "@/lib/game/series";
import { useMutation, useSuspenseQuery } from "@tanstack/react-query";
import { useJam } from "./use-jam";
import { useTimeout } from "./use-timeout";

export const useBout = (series: Series, index: number) =>
  useSuspenseQuery<Bout>({
    queryKey: Bout.generateKey(series.id, series.boutIds[index]),
    queryFn: () => getBout(series.boutIds[index]),
  });

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

export const useActiveJam = (bout: Bout) => {
  let periodNum =
    bout.jamIds
      .reverse()
      .findIndex((periodJamIds: number[]) => periodJamIds.length == 0) - 1;
  if (periodNum < 0) {
    periodNum = 0;
  }
  let jamNum = bout.jamIds[periodNum].length - 1;
  if (jamNum < 0) {
    jamNum = 0;
  }

  return useJam(bout, periodNum, jamNum);
};

export const useLatestTimeout = (bout: Bout) => {
  let timeoutIndex = bout.timeoutIds.length - 1;
  if (timeoutIndex < 0) {
    timeoutIndex = 0;
  }

  return useTimeout(bout, timeoutIndex);
};
