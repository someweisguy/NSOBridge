import { undo } from "@/lib/history";
import { MutationOptions } from "@/types/query";
import { useMutation } from "@tanstack/react-query";

export const useUndo = (options?: MutationOptions<void>) =>
  useMutation({
    mutationFn: () => undo(),
    ...options,
  });
