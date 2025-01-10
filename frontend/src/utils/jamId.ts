import { JamIdType } from "../types/JamIdType";

export function getNextJamId(
  jamCounts: [number, number],
  jamId: JamIdType
): JamIdType | null {
  const [periodNum, jamNum] = jamId;
  let jamScalar: number = jamNum + 1;
  if (periodNum == 1) {
    jamScalar += jamCounts[0];
  }

  // Prevent out-of-bounds error
  const maxScalar: number = jamCounts.reduce((sum, count) => (sum += count), 0);
  if (jamScalar >= maxScalar) {
    return null;
  }

  const newPeriodNum: number = Number(jamScalar >= jamCounts[0]);
  return [newPeriodNum, newPeriodNum != periodNum ? 0 : jamNum + 1];
}

export function getPreviousJamId(
  jamCounts: [number, number],
  jamId: JamIdType
): JamIdType | null {
  const [periodNum, jamNum] = jamId;
  let jamScalar: number = jamNum - 1;
  if (periodNum == 1) {
    jamScalar += jamCounts[0];
  }

  // Prevent out-of-bounds error
  if (jamScalar < 0) {
    return null;
  }

  return [Number(jamScalar >= jamCounts[0]), jamScalar % jamCounts[0]];
}

export function getActiveJamId(numJams: [number, number], playState: string) {
  const periodNum: number = Number(numJams[1] > 0);
  const jamNum: number = numJams[periodNum] - 1;

  let activeJamId: [number, number] = [periodNum, jamNum];
  if (playState !== "jam") {
    activeJamId = getPreviousJamId(numJams, activeJamId)!;
  }

  return activeJamId;
}
