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
  one: (uuid: string) => [...jamKeys.all, uuid] as const,
};

export const timeoutKeys = {
  all: ["timeouts"] as const,
  one: (uuid: string) => [...timeoutKeys.all, uuid] as const,
};
