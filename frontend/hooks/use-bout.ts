import { Bout, createBout, getBout } from "@/lib/game/bouts";
import { Series } from "@/lib/game/series";
import { useMutation, useSuspenseQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";

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

export const useLatestJamIndex = (bout: Bout) => {
  const [jamIndex, setJamIndex] = useState(bout.getLatestJamIndex());

  useEffect(() => {
    setJamIndex(bout.getLatestJamIndex());
  }, [bout]);

  return jamIndex;
};

export const useActiveJamIndex = (bout: Bout) => {
  const [jamIndex, setJamIndex] = useState(bout.getActiveJamIndex());

  useEffect(() => {
    setJamIndex(bout.getActiveJamIndex());
  }, [bout]);

  return jamIndex;
};

export const useLatestTimeoutIndex = (bout: Bout) => {
  const [timeoutIndex, setTimeoutIndex] = useState(
    bout.getLatestTimeoutIndex(),
  );

  useEffect(() => {
    setTimeoutIndex(bout.getLatestTimeoutIndex());
  }, [bout]);

  return timeoutIndex;
};

export const useActiveTimeoutIndex = (bout: Bout) => {
  const [timeoutIndex, setTimeoutIndex] = useState(
    bout.getActiveTimeoutIndex(),
  );

  useEffect(() => {
    setTimeoutIndex(bout.getActiveTimeoutIndex());
  }, [bout]);

  return timeoutIndex;
};
