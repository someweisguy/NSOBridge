type DateToString<T> = T extends Date
  ? string
  : T extends object
    ? { [K in keyof T]: DateToString<T[K]> }
    : T;

export default class Clock {
  public readonly id: number;

  public readonly startTimestamp: Date | null;
  public readonly elapsed: number;
  public readonly alarm: number;

  constructor(init: DateToString<Clock>) {
    this.startTimestamp =
      init.startTimestamp === null ? null : new Date(init.startTimestamp);
    this.elapsed = init.elapsed;
    this.alarm = init.alarm;
  }

  isRunning(): boolean {
    return this.startTimestamp !== null;
  }
}
