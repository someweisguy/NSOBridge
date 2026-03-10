import { undo } from "@/lib/history";
import { MutationOptions } from "@/types/query";
import { useMutation } from "@tanstack/react-query";

/**
 * Call the undo method on the server. Undo and redo histories are based on a user UUID
 * which is stored as a cookie on the server. Histories are volatile - they are reset
 * when the server is restarted.
 *
 * @returns A Tanstack Mutation object which can fire the Undo mutator.
 */
export const useUndo = (options?: Omit<MutationOptions<void>, "mutationFn">) =>
  useMutation({
    mutationFn: () => undo(),
    ...options,
  });
