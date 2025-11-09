import genericRequest from "../requests";

type DateToString<T> = T extends Date
  ? string
  : T extends object
    ? { [K in keyof T]: DateToString<T[K]> }
    : T;

export class Timeout {
  public readonly id: number;

  public readonly teamId: number | null;
  public readonly jamId: number | null;
  public readonly startTimestamp: Date | null;
  public readonly stopTimestamp: Date | null;
  public readonly clockElapsed: number;

  public readonly isReview: boolean;
  public readonly details: string;
  public readonly result: string;
  public readonly retained: boolean;

  static generateKey(bout_id: number, index: number) {
    return ["timeouts", bout_id, index];
  }

  constructor(init: DateToString<Timeout>) {
    Object.assign(this, init);
    this.startTimestamp =
      init?.startTimestamp == null ? null : new Date(init.startTimestamp);
    this.stopTimestamp =
      init?.stopTimestamp == null ? null : new Date(init.stopTimestamp);
  }
}

export async function getTimeout(
  cacheKey: ReturnType<typeof Timeout.generateKey>,
): Promise<Timeout> {
  const [, boutId, index] = cacheKey;
  const response: DateToString<Timeout> = await genericRequest(
    "timeout",
    "GET",
    {
      boutId,
      index,
    },
  );
  return new Timeout(response);
}
