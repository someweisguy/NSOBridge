import {
  UseMutationOptions,
  UseQueryOptions,
  UseSuspenseQueryOptions,
} from "@tanstack/react-query";

export type AppSuspenseQueryOptions<T = unknown, E = Error, D = T> = Omit<
  UseSuspenseQueryOptions<T, E, D>,
  "queryKey" | "queryFn"
>;

export type AppQueryOptions<T> = Omit<
  UseQueryOptions<T>,
  "queryKey" | "queryFn"
>;

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
