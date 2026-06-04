/**
 * Generate cache keys for roller derby model queries.
 */
export const generateQueryKey = {
  series(seriesUuid?: string) {
    return ["series", seriesUuid].filter((val) => val !== undefined);
  },
  bout(boutUuid?: string) {
    return ["bouts", boutUuid].filter((val) => val !== undefined);
  },
  jam(boutUuid: string, periodNum: number, jamNum: number) {
    return ["jams", boutUuid, periodNum, jamNum];
  },
  timeout(boutUuid: string, timeoutNum: number) {
    return ["timeouts", boutUuid, timeoutNum];
  },
  ruleset(boutUuid: string) {
    return ["rulesets", boutUuid];
  },
};
