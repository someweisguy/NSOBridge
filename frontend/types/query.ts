import {
  UseMutationOptions,
  UseQueryOptions,
  UseSuspenseQueryOptions,
} from "@tanstack/react-query";

/**
 * The cache key type. When a cached object should be invalidated, the server sends its
 * cache key to all clients via a WebSockets packet. Cache keys are arrays which begin
 * with its database table name, followed by identifiers which can uniquely identify the
 * object.
 */
export type CacheKey = [string, ...unknown[]];

/**
 * A cache item received from the server. Contains the value of the item as well
 * as its cache key.
 */
export interface CacheItem {
  key: CacheKey;
  value: unknown;
}

/**
 * Suspense query options used in hooks throughout this app. This type is based on
 * Tanstack Query's useSuspenseQuery object. The query key and query function are
 * provided in built-in hooks so they are omitted from this type.
 */
export type AppSuspenseQueryOptions<T = unknown, D = T> = Omit<
  UseSuspenseQueryOptions<T, Error, D>,
  "queryKey" | "queryFn"
>;

/**
 * Query options used in hooks throughout this app. This type is based on Tanstack
 * Query's useQuery object. The query key and query function are provided in built-in
 * hooks so they are omitted from this type.
 */
export type AppQueryOptions<T, D = T> = Omit<
  UseQueryOptions<T, Error, D>,
  "queryKey" | "queryFn"
>;

/**
 * Mutation options used in hooks throughout this app. This type is based on Tanstack
 * Query's useMutation object. The mutation function are provided in built-in hooks so
 * it is omitted from this type.
 */
export type AppMutationOptions<
  TData = unknown,
  TError = Error,
  TVariables = void,
  TContext = unknown,
> = Omit<UseMutationOptions<TData, TError, TVariables, TContext>, "mutateFn">;

export interface CacheUuid {
  /**
   * The UUID of the object.
   */
  uuid: string;
}
