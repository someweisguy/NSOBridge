import { localAPI } from "@/lib/requests";
import { Jam } from "@/types/jam";
import {
  AppQueryOptions,
  AppSuspenseQueryOptions,
  JamUri,
} from "@/types/query";
import { jamKeys } from "@/utils/query-keys";
import { useQuery, useSuspenseQuery } from "@tanstack/react-query";

/**
 * Fetches the desired Jam from the server. This hook is a wrapper for call to TanStack
 * Query's `useQuery` function.
 *
 * @returns a Tanstack useQuery object containing the desired Jam.
 */
export const useJam = ({
  boutUuid,
  periodNum,
  jamNum,
  ...options
}: JamUri & AppQueryOptions<Jam>) =>
  useQuery({
    queryKey: jamKeys.one(boutUuid, periodNum, jamNum),
    queryFn: () =>
      localAPI.get<Jam>("jam", {
        query: { boutUuid, periodNum, jamNum },
      }),
    ...options,
  });

/**
 * Fetches the desired Jam from the server. This hook is a wrapper for call to TanStack
 * Query's `useSuspenseQuery` function.
 *
 * @returns a Tanstack useSuspenseQuery object containing the desired Jam.
 */
export const useSuspenseJam = <T = Jam>({
  boutUuid,
  periodNum,
  jamNum,
  ...options
}: JamUri & AppSuspenseQueryOptions<Jam, T>) =>
  useSuspenseQuery<Jam, Error, T>({
    queryKey: jamKeys.one(boutUuid, periodNum, jamNum),
    queryFn: () =>
      localAPI.get<Jam>("jam", {
        query: { boutUuid, periodNum, jamNum },
      }),
    ...options,
  });
