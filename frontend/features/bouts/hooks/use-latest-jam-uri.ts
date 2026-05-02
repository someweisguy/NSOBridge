import { Bout } from "@/types/bout";
import { JamUri } from "@/types/query";
import { useEffect, useState } from "react";

const getLatestJamUri = ({
  uuid,
  jamCounts,
}: Pick<Bout, "jamCounts" | "uuid">) => {
  let periodNum = 0;
  for (let i = jamCounts.length - 1; i >= 0; --i) {
    // Get the latest Period number that contains Jams
    if (jamCounts[i] > 0) {
      periodNum = i;
      break;
    }
  }
  const jamNum = jamCounts[periodNum] - 1;

  return { boutUuid: uuid, periodNum, jamNum };
};

/**
 * Get a URI which identifies the latest Jam in this Bout. The latest Jam is the first
 * Jam that has not started.
 *
 * @param bout The Bout of which to use the latest Jam URI.
 * @returns a URI to the latest Jam.
 */
export default function useLatestJamUri(bout: Bout): JamUri {
  const [jamUri, setJamUri] = useState(getLatestJamUri(bout));

  useEffect(
    () =>
      setJamUri(
        getLatestJamUri({ uuid: bout.uuid, jamCounts: bout.jamCounts }),
      ),
    [bout.uuid, bout.jamCounts],
  );

  return jamUri;
}
