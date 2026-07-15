/**
 * Generate cache keys for roller derby model queries.
 */

export const seriesKeys = {
  all: ["series"] as const,
  one: (seriesUuid: string) => [...seriesKeys.all, seriesUuid] as const,
};

export const boutKeys = {
  all: ["bouts"] as const,
  one: (boutUuid: string) => [...boutKeys.all, boutUuid] as const,
};

export const rulesetKeys = {
  all: ["rulesets"] as const,
  one: (rulesetName: string) => [...rulesetKeys.all, rulesetName] as const,
};

export const jamKeys = {
  all: ["jams"] as const,
  one: (boutUuid: string, periodNum: number, jamNum: number) => [
    ...jamKeys.all,
    boutUuid,
    [periodNum, jamNum],
  ],
};

export const timeoutKeys = {
  all: ["timeouts"] as const,
  one: (boutUuid: string, timeoutNum: number) => [
    ...timeoutKeys.all,
    boutUuid,
    timeoutNum,
  ],
};
