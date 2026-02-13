import { undo } from "@/lib/history";
import { useMutation } from "@tanstack/react-query";

export const useUndo = () =>
  useMutation({
    mutationFn: () => undo(),
  });
