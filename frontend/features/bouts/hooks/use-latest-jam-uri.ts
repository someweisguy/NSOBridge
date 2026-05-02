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
