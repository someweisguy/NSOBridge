import {
  UseMutationOptions,
  UseQueryOptions,
  UseSuspenseQueryOptions,
} from "@tanstack/react-query";

export type SuspenseQueryOptions<T> = Omit<
  UseSuspenseQueryOptions<T>,
  "queryKey" | "queryFn"
>;

export type QueryOptions<T> = Omit<UseQueryOptions<T>, "queryKey" | "queryFn">;

export type MutationOptions<
  TData = unknown,
  TError = Error,
  TVariables = void,
  TContext = unknown,
> = Omit<UseMutationOptions<TData, TError, TVariables, TContext>, "mutateFn">;
