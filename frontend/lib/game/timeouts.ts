import { Timeout } from "@/types/game";
import { localAPI } from "../requests";

export async function getTimeout(
  boutId: number,
  index: number,
): Promise<Timeout> {
  const data = await localAPI.get("timeout", { query: { boutId, index } });
  return Object.assign(new Timeout(), data);
}
