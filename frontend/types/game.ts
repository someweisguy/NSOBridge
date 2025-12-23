export class Ruleset {
  jamDuration: number;
  lineupDuration: number;
  pointsPerTrip: number;
  numTimeouts: number;
  numReviews: number;

  static generateKey(rulesetName: string) {
    return ["ruleset", rulesetName];
  }
}
