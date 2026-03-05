import {
  UseMutationOptions,
  UseQueryOptions,
  UseSuspenseQueryOptions,
} from "@tanstack/react-query";

export type SuspenseQueryOptions<T = unknown, E = Error, D = T> = Omit<
  UseSuspenseQueryOptions<T, E, D>,
  "queryKey" | "queryFn"
>;

export type QueryOptions<T> = Omit<UseQueryOptions<T>, "queryKey" | "queryFn">;

export type MutationOptions<
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
   * The TeamJam number.
   */
  teamJamNum: number;
}
