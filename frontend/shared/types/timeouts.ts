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

  static generateKey(bout_id: number, index: number) {
    return ["timeouts", bout_id, index];
  }
}
