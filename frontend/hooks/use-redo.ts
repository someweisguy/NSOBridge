import { redo } from "@/lib/history";
import { AppMutationOptions } from "@/types/query";
import { useMutation } from "@tanstack/react-query";

/**
 * Call the redo method on the server. Undo and redo histories are based on a user UUID
 * which is stored as a cookie on the server. Histories are volatile - they are reset
 * when the server is restarted.
 *
 * @returns A Tanstack Mutation object which can fire the Redo mutator.
 */
export const useRedo = (options?: AppMutationOptions<void>) =>
  useMutation({
    mutationFn: () => redo(),
    ...options,
  });
