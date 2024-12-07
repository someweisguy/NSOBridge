import { useSuspenseQuery } from "@tanstack/react-query";
import { JamIdType } from "../types/JamIdType";
import { JamType } from "../types/JamType";
import dispatch from "../app/client";
import { keyFactory } from "../utils/keyFactory";

export default function useJam(boutId: string, jamId: JamIdType): JamType {
  const { data } = useSuspenseQuery<JamType>({
    queryKey: keyFactory.jam(boutId, jamId),
    queryFn: () => dispatch("jam", "get", { boutId, jamId }),
  });

  return data;
}
