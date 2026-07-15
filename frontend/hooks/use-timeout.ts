import { localAPI } from "@/lib/requests";
import {
  AppQueryOptions,
  AppSuspenseQueryOptions,
  TimeoutUri,
} from "@/types/query";
import { Timeout } from "@/types/timeout";
import { timeoutKeys } from "@/utils/query-keys";
import {
  useQuery,
  UseQueryResult,
  useSuspenseQuery,
} from "@tanstack/react-query";

/**
 * Fetches the desired Timeout from the server. This hook is a wrapper for call to
 * TanStack Query's `useQuery` function.
 *
 * @returns a Tanstack useQuery object containing the desired Timeout.
 */
export const useTimeout = ({
  boutUuid,
  timeoutNum,
  ...options
}: TimeoutUri & AppQueryOptions<Timeout>): UseQueryResult<Timeout, Error> =>
  useQuery({
    queryKey: timeoutKeys.one(boutUuid, timeoutNum),
    queryFn: () =>
      localAPI.get<Timeout>("timeout", {
        query: { boutUuid, num: timeoutNum }, // TODO: fix alias
      }),
    ...options,
  });

/**
 * Fetches the desired Timeout from the server. This hook is a wrapper for call to
 * TanStack Query's `useSuspenseQuery` function.
 *
 * @returns a Tanstack useSuspenseQuery object containing the desired Timeout.
 */
export const useSuspenseTimeout = ({
  boutUuid,
  timeoutNum,
  ...options
}: TimeoutUri & AppSuspenseQueryOptions<Timeout>) =>
  useSuspenseQuery({
    queryKey: timeoutKeys.one(boutUuid, timeoutNum),
    queryFn: () =>
      localAPI.get<Timeout>("timeout", {
        query: { boutUuid, num: timeoutNum }, // TODO: fix alias
      }),
    ...options,
  });
