import useSuspendIfNullable from "@/hooks/use-suspend-if-nullable";
import { useTimeout } from "@/hooks/use-timeout";
import { Bout } from "@/types/bout";
import { Timeout } from "@/types/timeout";
import { UseSuspenseQueryResult } from "@tanstack/react-query";

/**
 * Get the latest Timeout in the Bout. If no Timeouts exist, null is returned.
 *
 * @param bout The desired Bout.
 * @returns A Tanstack Suspense Query object pointing to the latest Timeout.
 */
export default function useSuspenseLatestTimeout(bout: Bout) {
  // Use a non-suspense query function because we need to be able to disable the
  // query when there aren't any Timeouts in the Bout
  const enabled = bout.timeoutCount > 0;
  const queryData = useTimeout<null>({
    boutUuid: bout.uuid,
    timeoutNum: bout.timeoutCount - 1,
    initialData: null,
    enabled,
  });
  useSuspendIfNullable(queryData.data, enabled);

  return queryData as UseSuspenseQueryResult<Timeout | null>;
}
