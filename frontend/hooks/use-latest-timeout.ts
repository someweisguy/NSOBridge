import { useTimeout } from "@/hooks/use-timeout";
import { Bout } from "@/types/bout";

/**
 * Get the latest Timeout in the Bout. If no Timeouts exist, null is returned.
 *
 * @param bout The desired Bout.
 * @returns A Tanstack Suspense Query object pointing to the latest Timeout.
 */
export default function useLatestTimeout(bout: Bout) {
  const queryData = useTimeout({
    uuid: bout.timeoutUuids[bout.timeoutUuids.length - 1],
    enabled: bout.timeoutUuids.length > 0,
  });

  return queryData;
}
