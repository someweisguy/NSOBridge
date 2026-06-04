import { Bout } from "@/types/bout";
import { JamUri } from "@/types/query";
import { useEffect, useState } from "react";
import useLatestJamUri from "./use-latest-jam-uri";

const getActiveJamUri = ({ uuid, jamHead }: Bout) => {
  return { boutUuid: uuid, ...jamHead };
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
  const [jamUri, setJamUri] = useState<JamUri | null>(getActiveJamUri(bout));

  useEffect(() => setJamUri(getActiveJamUri(bout)), [bout]);

  const latestJamUri = useLatestJamUri(bout);

  return jamUri ?? latestJamUri;
}
