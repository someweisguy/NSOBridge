import { localAPI } from "@/lib/requests";
import { Bout } from "@/types/bout";
import { AppMutationOptions } from "@/types/query";
import { useMutation } from "@tanstack/react-query";

type EditableBout = Partial<Pick<Bout, "timeToDerbyTimestamp" | "rulesetName">>;

export interface useUpdateBoutProps extends AppMutationOptions<
  void,
  Error,
  EditableBout
> {
  uuid: string;
}

/**
 * Used to update the specified Bout.
 *
 * @returns A Tanstack Mutation object which can fire the updateBout mutator.
 */
export const useUpdateBout = ({ uuid, ...options }: useUpdateBoutProps) =>
  useMutation({
    mutationFn: (updates: EditableBout) =>
      localAPI.put<void>("bout", {
        query: { uuid },
        body: updates,
      }),
    ...options,
  });
