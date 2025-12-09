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

export async function jamAddTrip(
  boutId: number,
  periodNum: number,
  jamNum: number,
  teamId: number,
  passes: number,
) {
  await localAPI.post("jam/add-trip", {
    query: { boutId, periodNum, jamNum, teamId },
    body: passes,
  });
}

export async function jamSetLead(
  boutId: number,
  periodNum: number,
  jamNum: number,
  teamId: number,
  lead: boolean,
) {
  await localAPI.post("jam/set-lead", {
    query: { boutId, periodNum, jamNum, teamId },
    body: lead,
  });
}

export async function jamSetLost(
  boutId: number,
  periodNum: number,
  jamNum: number,
  teamId: number,
  lost: boolean,
) {
  await localAPI.post("jam/set-lost", {
    query: { boutId, periodNum, jamNum, teamId },
    body: lost,
  });
}

export async function jamSetStarPass(
  boutId: number,
  periodNum: number,
  jamNum: number,
  teamId: number,
  starPass: boolean,
) {
  await localAPI.post("jam/set-star-pass", {
    query: { boutId, periodNum, jamNum, teamId },
    body: starPass,
  });
}
