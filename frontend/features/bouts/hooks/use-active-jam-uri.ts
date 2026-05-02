import { Bout } from "@/types/bout";
import { JamUri } from "@/types/query";
import { useEffect, useState } from "react";
import useLatestJamUri from "./use-latest-jam-uri";

const getActiveJamUri = ({
  uuid,
  jamCounts,
}: Pick<Bout, "uuid" | "jamCounts">) => {
  let periodNum = 0;
  for (let i = jamCounts.length - 1; i >= 0; --i) {
    // Get the latest Period number that contains Jams
    if (jamCounts[i] > 0) {
      periodNum = i;
      break;
    }
  }
  if (jamCounts[periodNum] < 2) {
    return null; // There is no active Jam
  }
  const jamNum = jamCounts[periodNum] - 2;

  return { boutUuid: uuid, periodNum, jamNum };
};

/**
 * Get a URI which identifies the active Jam in this Bout. The active Jam is the last
 * Jam which is running or has ended. If no Jam meets this condition, the latest Jam
 * is returned.
 *
 * @param bout The bout of which to use the active Jam URI.
 * @returns a URI to the active Jam.
 */
export default function useActiveJamUri(bout: Bout): JamUri {
  const [jamUri, setJamUri] = useState<JamUri | null>(
    getActiveJamUri({ uuid: bout.uuid, jamCounts: bout.jamCounts }),
  );

  useEffect(
    () =>
      setJamUri(
        getActiveJamUri({ uuid: bout.uuid, jamCounts: bout.jamCounts }),
      ),
    [bout.uuid, bout.jamCounts],
  );

  const latestJamUri = useLatestJamUri(bout);

  return jamUri ?? latestJamUri;
}
