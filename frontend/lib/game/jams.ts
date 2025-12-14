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
  jamId: number,
  teamId: number,
  passes: number,
) {
  await localAPI.post("jam/add-trip", {
    query: { jamId, teamId },
    body: passes,
  });
}

export async function jamSetLead(jamId: number, teamId: number, lead: boolean) {
  await localAPI.post("jam/set-lead", {
    query: { jamId, teamId },
    body: lead,
  });
}

export async function jamSetLost(jamId: number, teamId: number, lost: boolean) {
  await localAPI.post("jam/set-lost", {
    query: { jamId, teamId },
    body: lost,
  });
}

export async function jamSetStarPass(
  jamId: number,
  teamId: number,
  starPass: boolean,
) {
  await localAPI.post("jam/set-star-pass", {
    query: { jamId, teamId },
    body: starPass,
  });
}
