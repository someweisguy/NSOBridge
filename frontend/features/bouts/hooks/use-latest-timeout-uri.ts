import { Bout } from "@/types/bout";
import { TimeoutUri } from "@/types/query";
import { useEffect, useState } from "react";

const getLatestTimeoutUri = ({
  uuid,
  timeoutCount,
}: Pick<Bout, "uuid" | "timeoutCount">) => {
  return { boutUuid: uuid, timeoutNum: timeoutCount - 1 };
};

/**
 * Get a URI which identifies the latest Timeout. The latest Timeout is the timeout
 * which was most recently called. If no Timeouts have been called, the timeoutNum
 * parameter is -1.
 *
 * @returns a URI to the latest Timeout.
 */
export default function useLatestTimeoutUri(bout: Bout): TimeoutUri {
  const [timeoutUri, setTimeoutUri] = useState(
    getLatestTimeoutUri({ ...bout }),
  );

  useEffect(() => {
    setTimeoutUri(
      getLatestTimeoutUri({ uuid: bout.uuid, timeoutCount: bout.timeoutCount }),
    );
  }, [bout.uuid, bout.timeoutCount]);

  return timeoutUri;
}
