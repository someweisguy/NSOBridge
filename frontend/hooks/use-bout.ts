import queryClient from "@/lib/cache";
import { Bout, createBout, getAllBouts, getBout } from "@/lib/game/bouts";
import { useMutation, useQuery, useSuspenseQuery } from "@tanstack/react-query";

export const useSuspenseAllBouts = () =>
  useSuspenseQuery(
    {
      queryKey: Bout.generateKey(),
      queryFn: () =>
        getAllBouts().then((bouts: Bout[]) => {
          for (const bout of bouts) {
            queryClient.setQueryData(Bout.generateKey(bout.uuid), bout);
          }
          return bouts;
        }),
    },
    queryClient,
  );

export const useBout = (uuid: string) =>
  useQuery({
    queryKey: Bout.generateKey(uuid),
    queryFn: () => getBout(uuid),
  });

export const useSuspenseBout = (uuid: string) =>
  useSuspenseQuery({
    queryKey: Bout.generateKey(uuid),
    queryFn: () => getBout(uuid),
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
