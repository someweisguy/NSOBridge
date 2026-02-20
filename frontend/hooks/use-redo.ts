import { redo } from "@/lib/history";
import { MutationOptions } from "@/types/query";
import { useMutation } from "@tanstack/react-query";

export const useRedo = (options?: Omit<MutationOptions<void>, "mutationFn">) =>
  useMutation({
    mutationFn: () => redo(),
    ...options,
  });
