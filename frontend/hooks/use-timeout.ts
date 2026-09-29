import { localAPI } from "@/lib/requests";
import {
  AppQueryOptions,
  AppSuspenseQueryOptions,
  CacheUuid,
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
export const useTimeout = <T = Timeout>({
  uuid,
  ...options
}: CacheUuid & AppQueryOptions<Timeout | T>): UseQueryResult<
  Timeout | T,
  Error
> =>
  useQuery({
    queryKey: timeoutKeys.one(uuid),
    queryFn: () => localAPI.get<Timeout>("timeout", { query: { uuid } }),
    ...options,
  });

/**
 * Fetches the desired Timeout from the server. This hook is a wrapper for call to
 * TanStack Query's `useSuspenseQuery` function.
 *
 * @returns a Tanstack useSuspenseQuery object containing the desired Timeout.
 */
export const useSuspenseTimeout = ({
  uuid,
  ...options
}: CacheUuid & AppSuspenseQueryOptions<Timeout>) =>
  useSuspenseQuery({
    queryKey: timeoutKeys.one(uuid),
    queryFn: () => localAPI.get<Timeout>("timeout", { query: { uuid } }),
    ...options,
  });
