export const keyFactory = {
  series: () => ["series"],
  bout: (boutId: string) => ["bout", boutId],
  jam: (boutId: string, periodNum: number, jamNum: number) => [
    "jam",
    boutId,
    periodNum,
    jamNum,
  ],
};
