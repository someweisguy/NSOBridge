export class Roster {
  id: number;
  name: string;

  static generateKey(rosterId: number) {
    return ["rosters", rosterId];
  }
}
