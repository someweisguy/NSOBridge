export type CacheKey = [string, (string | number | boolean | null)[], object];

export interface ServerData {
  process: Date | null;
  server: Date;
  version: string;
}

export interface SyncData {
  offset: number;
  error: number;
}
