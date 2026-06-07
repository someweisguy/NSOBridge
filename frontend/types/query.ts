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
export type AppQueryOptions<T> = Omit<
  UseQueryOptions<T, Error, T>,
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

/**
 * A URI which uniquely identifies a Bout.
 */
export interface BoutUri {
  /**
   * The UUID of the Bout.
   */
  boutUuid: string;
}

/**
 * A URI which uniquely identifies a Team within a Bout.
 */
export interface TeamUri extends BoutUri {
  /**
   * The unique Team identifier.
   */
  teamNum: number;
}

/**
 * A URI which uniquely identifies a Jam.
 */
export interface JamUri extends BoutUri {
  /**
   * The Period number of the Jam.
   */
  periodNum: number;
  /**
   * The Jam number of the Jam.
   */
  jamNum: number;
}

/**
 * A URI which uniquely identifies a Timeout in a Bout.
 */
export interface TimeoutUri extends BoutUri {
  /**
   * The Timeout number.
   */
  timeoutNum: number;
}

/**
 * A URI which uniquely identifies a TeamJam within a Jam.
 */
export interface TeamJamUri extends JamUri {
  /**
   * The Team number. In game types with more than two teams it should be ensured that
   * the specified Team is in the desired TeamJam.
   */
  teamNum: number;
}

/**
 * A URI which uniquely identifies a Trip Event within a TeamJam.
 */
export interface TripEventUri extends TeamJamUri {
  /**
   * The Trip Event number.
   */
  eventNum: number;
}
