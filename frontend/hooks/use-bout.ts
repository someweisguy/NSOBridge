import { Bout, createBout, getBout } from "@/lib/game/bouts";
import { Series } from "@/lib/game/series";
import { useMutation, useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";

export const useSuspenseBout = (series: Series, index?: number) => {
  const [boutId, setBoutId] = useState(
    index == undefined
      ? (series.activeBoutId ?? series.boutIds[series.boutIds.length - 1])
      : series.boutIds[index],
  );

  useEffect(() => {
    setBoutId(
      index == undefined
        ? (series.activeBoutId ?? series.boutIds[series.boutIds.length - 1])
        : series.boutIds[index],
    );
  }, [series, index]);

  return useSuspenseQuery<Bout>({
    queryKey: Bout.generateKey(series.id, boutId),
    queryFn: () => getBout(boutId),
  });
};

export const useBout = (series: Series, index?: number) => {
  const [boutId, setBoutId] = useState(
    index == undefined
      ? (series.activeBoutId ?? series.boutIds[series.boutIds.length - 1])
      : series.boutIds[index],
  );

  useEffect(() => {
    setBoutId(
      index == undefined
        ? (series.activeBoutId ?? series.boutIds[series.boutIds.length - 1])
        : series.boutIds[index],
    );
  }, [series, index]);

  return useQuery<Bout>({
    queryKey: Bout.generateKey(series.id, boutId),
    queryFn: () => getBout(boutId),
  });
};

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
