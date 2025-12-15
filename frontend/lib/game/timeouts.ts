import { Timeout } from "@/types/game";
import { localAPI } from "../requests";

export async function getTimeout(
  boutId: number,
  index: number,
): Promise<Timeout | null> {
  const data = await localAPI.get("timeout", { query: { boutId, index } });
  return data !== null ? Object.assign(new Timeout(), data) : null;
}

export async function timeoutSetType(
  timeoutId: number,
  type: "timeout" | "review",
): Promise<void> {
  await localAPI.post("timeout/type", {
    query: { timeoutId },
    body: JSON.stringify(type),
  });
}

export async function timeoutSetTeam(
  timeoutId: number,
  team: number | null,
): Promise<void> {
  await localAPI.post("timeout/team", { query: { timeoutId }, body: team });
}

export async function timeoutSetRetained(
  timeoutId: number,
  isRetained: boolean,
): Promise<void> {
  await localAPI.post("timeout/retained", {
    query: { timeoutId },
    body: isRetained,
  });
}
