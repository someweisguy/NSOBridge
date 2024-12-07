import { useSuspenseQuery } from "@tanstack/react-query";
import { JamIdType } from "../types/JamIdType";
import { JamType } from "../types/JamType";
import dispatch from "../app/client";


export default function useJam(boutId: string, jamId: JamIdType): JamType {
  const { data } = useSuspenseQuery<JamType>({
    queryKey: ["jam", boutId, jamId],
    queryFn: () => dispatch("jam", "get", {boutId, jamId})
  });

  return data;
}
