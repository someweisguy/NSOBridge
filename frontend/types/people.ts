export class Roster {
  id: number;
  name: string;

  static generateKey(id: number) {
    return ["rosters", id];
  }
}
