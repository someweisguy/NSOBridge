import { redo } from "@/lib/history";
import { MutationOptions } from "@/types/query";
import { useMutation } from "@tanstack/react-query";

export const useRedo = (options?: MutationOptions<void>) =>
  useMutation({
    mutationFn: () => redo(),
    ...options,
  });
