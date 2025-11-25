export default class Clock {
  id: number;

  startTimestamp: Date | null;
  elapsed: number;
  alarm: number;

  isRunning(): boolean {
    return this.startTimestamp !== null;
  }
}
