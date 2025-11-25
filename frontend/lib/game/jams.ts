import { Jam } from "@/types/game";
import { localAPI } from "../requests";

export async function getJam(
  boutId: number,
  periodNum: number,
  jamNum: number,
): Promise<Jam> {
  const data = await localAPI.get("jam", {
    query: {
      boutId,
      periodNum,
      jamNum,
    },
  });
  return Object.assign(new Jam(), data);
}
