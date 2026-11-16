import { localAPI } from "@/lib/requests";
import { AppMutationOptions } from "@/types/query";
import { useMutation } from "@tanstack/react-query";

export interface UseSetTimeToDerbyProps extends AppMutationOptions<
  void,
  Error,
  string
> {
  uuid: string;
}

/**
 * Used to set the time-to-derby of the specified Bout.
 *
 * @returns A Tanstack Mutation object which can fire the setTimeToDerby
 * mutator.
 */
export const useSetTimeToDerby = ({
  uuid,
  ...options
}: UseSetTimeToDerbyProps) =>
  useMutation({
    mutationFn: (value: string) =>
      localAPI.put<void>("bout/timeToDerby", {
        query: { uuid },
        body: JSON.stringify(value),
      }),
    ...options,
  });
