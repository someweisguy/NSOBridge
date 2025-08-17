import { getSyncData } from "@/lib/sync";
import { useSuspenseQuery } from "@tanstack/react-query";

const REFETCH_INTERVAL = 1000 * 60 * 5;

export default function useServerOffset(): { offset: number; error: number } {
  const { data } = useSuspenseQuery({
    queryKey: ["useServerTimeReactHook"],
    queryFn: getSyncData,
    refetchInterval: REFETCH_INTERVAL,
  });

  return data;
}
