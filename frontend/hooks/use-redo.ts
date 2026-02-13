import { redo } from "@/lib/history";
import { useMutation } from "@tanstack/react-query";

export const useRedo = () =>
  useMutation({
    mutationFn: () => redo(),
  });
