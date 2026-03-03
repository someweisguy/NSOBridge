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

export interface BoutUri {
  boutUuid: string;
}

export interface JamUri extends BoutUri {
  periodNum: number;
  jamNum: number;
}

export interface TimeoutUri extends BoutUri {
  timeoutNum: number;
}

export interface TeamJamUri extends JamUri {
  teamJamNum: number;
}
