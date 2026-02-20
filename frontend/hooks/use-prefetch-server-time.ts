import queryClient from "@/lib/cache";
import { getSyncData, serverTimeCacheKey } from "../lib/sync";

export const usePrefetchServerTime = () =>
  void queryClient.prefetchQuery({
    queryKey: [serverTimeCacheKey],
    queryFn: () => getSyncData(),
  });
