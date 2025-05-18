import queryClient from "@/lib/cache";
import { getJam } from "@/lib/client/api/jam";
import { keyFactory } from "@/utils/key-factory";
import { useEffect } from "react";

export default function usePrefetchJam(
  boutId: string,
  jamId: [number, number] | null
) {
  useEffect(() => {
    if (jamId !== null) {
      const [periodNum, jamNum] = jamId;
      void queryClient.prefetchQuery({
        queryKey: keyFactory.jam(boutId, periodNum, jamNum),
        queryFn: () => getJam(boutId, periodNum, jamNum),
      });
    }
  }, [boutId, jamId]);
}
