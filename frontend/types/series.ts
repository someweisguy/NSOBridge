/**
 * Represent an event with multiple Bouts. A Series is simply a collection of multiple
 * Bouts. This grouping can be used to track per-event statistics, such as the number
 * of team wins/losses during a tournament Series.
 */
export interface Series {
  /**
   * The unique identifier of this Series.
   */
  uuid: string;
  /**
   * The name of the Series.
   */
  name: string;
  /**
   * The UUIDs of the Bouts in this Series.
   */
  boutUuids: string[];
  /**
   * The UUID of the active Bout in this Series.
   */
  activeBoutUuid: string;
}
