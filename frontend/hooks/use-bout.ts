import queryClient from "@/lib/cache";
import { Bout, createBout, getBout } from "@/lib/game/bouts";
import { getJam, Jam } from "@/lib/game/jams";
import { Series } from "@/lib/game/series";
import { getTimeout, Timeout } from "@/lib/game/timeouts";
import { useMutation, useSuspenseQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";

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

  return useSuspenseQuery<Bout>({
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

export const useActiveOrLatestJamIndex = (bout: Bout) => {
  const [jamIndex, setJamIndex] = useState(
    bout.getActiveJamIndex() ?? bout.getLatestJamIndex(),
  );

  useEffect(() => {
    setJamIndex(bout.getActiveJamIndex() ?? bout.getLatestJamIndex());
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

export const useActiveOrLatestTimeoutIndex = (bout: Bout) => {
  const [timeoutIndex, setTimeoutIndex] = useState(
    bout.getActiveTimeoutIndex() ?? bout.getLatestTimeoutIndex(),
  );

  useEffect(() => {
    setTimeoutIndex(
      bout.getActiveTimeoutIndex() ?? bout.getLatestTimeoutIndex(),
    );
  }, [bout]);

  return timeoutIndex;
};

export const usePrefetchBoutData = (bout: Bout) => {
  const latestJamIndex = useLatestJamIndex(bout);
  const latestTimeoutIndex = useLatestTimeoutIndex(bout);

  useEffect(() => {
    // Prefetch the next Jam
    const [latestPeriodNum, latestJamNum] = latestJamIndex;
    const latestJamId = bout.jamIds[latestPeriodNum][latestJamNum];
    // FIXME: this attempts to fetch Jams with undefined ID
    void queryClient.prefetchQuery({
      queryKey: Jam.generateKey(bout.seriesId, bout.id, latestJamId),
      queryFn: () => getJam(latestJamId),
    });

    // Prefetch the next Timeout
    const latestTimeoutId = bout.timeoutIds[latestTimeoutIndex];
    void queryClient.prefetchQuery({
      queryKey: Timeout.generateKey(bout.seriesId, bout.id, latestTimeoutId),
      queryFn: () => getTimeout(latestTimeoutId),
    });
  }, [bout, latestJamIndex, latestTimeoutIndex]);
};
