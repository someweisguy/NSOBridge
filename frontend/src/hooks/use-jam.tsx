import { useSuspenseQuery } from "@tanstack/react-query";
import dispatchRequest from "../lib/client";
import { keyFactory } from "../utils/key-factory";
import { JamIdType, JamType } from "../types/jam";

export default function useJam(boutId: string, jamId: JamIdType): JamType {
  const { data } = useSuspenseQuery<JamType>({
    queryKey: keyFactory.jam(boutId, jamId),
    queryFn: () => dispatchRequest("jam", "get", { boutId, jamId }),
  });

  return data;
}
