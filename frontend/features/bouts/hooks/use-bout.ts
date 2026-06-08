import queryClient from "@/lib/cache";
import { localAPI } from "@/lib/requests";
import { Bout } from "@/types/bout";
import {
  AppQueryOptions,
  AppSuspenseQueryOptions,
  BoutUri,
} from "@/types/query";
import { generateQueryKey } from "@/utils/query";
import { useQuery, useSuspenseQuery } from "@tanstack/react-query";

/**
 * Fetches the desired Bout from the server. This hook is a wrapper for call to TanStack
 * Query's `useQuery` function.
 *
 * @returns a Tanstack useQuery object containing the desired Bout.
 */
export const useBout = ({
  boutUuid,
  ...options
}: BoutUri & AppQueryOptions<Bout>) =>
  useQuery<Bout>({
    queryKey: generateQueryKey.bout(boutUuid),
    queryFn: () => localAPI.get("bout", { query: { boutUuid } }),
    ...options,
  });

/**
 * Fetches the desired Bout from the server. This hook is a wrapper for call to TanStack
 * Query's `useSuspenseQuery` function.
 *
 * @returns a Tanstack useSuspenseQuery object containing the desired Bout.
 */
export const useSuspenseBout = ({
  boutUuid,
  ...options
}: BoutUri & AppSuspenseQueryOptions<Bout>) =>
  useSuspenseQuery<Bout>({
    queryKey: generateQueryKey.bout(boutUuid),
    queryFn: () =>
      localAPI.get<Bout>("bout", {
        query: { boutUuid },
      }),
    ...options,
  });

/**
 * Gets all the Bouts from the server. Each individual Bout is automatically cached
 * after it is fetched. This hook is a wrapper for call to TanStack Query's `useQuery`
 * function.
 *
 * @returns a Tanstack useQuery object containing an array of all Bouts.
 */
export const useGetAllBouts = (options?: AppQueryOptions<Bout[]>) =>
  useQuery<Bout[]>(
    {
      queryKey: generateQueryKey.bout(),
      queryFn: () =>
        localAPI.get<Bout[]>("bout/allBouts").then((bouts) => {
          for (const bout of bouts) {
            if (bout.uuid != null) {
              queryClient.setQueryData(generateQueryKey.bout(bout.uuid), bout);
            }
          }
          return bouts;
        }),
      ...options,
    },
    queryClient,
  );

/**
 * Gets all the Bouts from the server. Each individual Bout is automatically cached
 * after it is fetched. This hook is a wrapper for call to TanStack Query's
 * `useSuspenseQuery` function.
 *
 * @returns a Tanstack useSuspenseQuery object containing an array of all Bouts.
 */
export const useSuspenseGetAllBouts = <T = Bout[]>(
  options?: AppSuspenseQueryOptions<Bout[], T>,
) =>
  useSuspenseQuery<Bout[], Error, T>(
    {
      queryKey: generateQueryKey.bout(),
      queryFn: () =>
        localAPI.get<Bout[]>("bout/allBouts").then((bouts: Bout[]) => {
          for (const bout of bouts) {
            if (bout.uuid != null) {
              queryClient.setQueryData(generateQueryKey.bout(bout.uuid), bout);
            }
          }
          return bouts;
        }),
      ...options,
    },
    queryClient,
  );
