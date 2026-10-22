import { localAPI } from "@/lib/requests";
import { Bout } from "@/types/bout";
import {
  AppQueryOptions,
  AppSuspenseQueryOptions,
  CacheUuid,
} from "@/types/query";
import { boutKeys } from "@/utils/query-keys";
import { useQuery, useSuspenseQuery } from "@tanstack/react-query";

/**
 * Fetches the desired Bout from the server. This hook is a wrapper for call to TanStack
 * Query's `useQuery` function.
 *
 * @returns a Tanstack useQuery object containing the desired Bout.
 */
export const useBout = <T = Bout>({
  uuid,
  ...options
}: CacheUuid & AppQueryOptions<Bout, T>) =>
  useQuery<Bout, Error, T>({
    queryKey: boutKeys.one(uuid),
    queryFn: () => localAPI.get("bout", { query: { uuid } }),
    ...options,
  });

/**
 * Fetches the desired Bout from the server. This hook is a wrapper for call to TanStack
 * Query's `useSuspenseQuery` function.
 *
 * @returns a Tanstack useSuspenseQuery object containing the desired Bout.
 */
export const useSuspenseBout = <T = Bout>({
  uuid,
  ...options
}: CacheUuid & AppSuspenseQueryOptions<Bout, T>) =>
  useSuspenseQuery<Bout, Error, T>({
    queryKey: boutKeys.one(uuid),
    queryFn: () =>
      localAPI.get<Bout>("bout", {
        query: { uuid },
      }),
    ...options,
  });
