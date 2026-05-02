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
