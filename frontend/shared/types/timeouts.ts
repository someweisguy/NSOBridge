export class Timeout {
  id: number;

  teamId: number | null;
  jamId: number | null;
  startTimestamp: Date | null;
  stopTimestamp: Date | null;
  clockElapsed: number;

  isReview: boolean;
  details: string;
  result: string;
  retained: boolean;

  static generateKey(boutId: number, index: number) {
    return ["timeouts", boutId, index];
  }
}
