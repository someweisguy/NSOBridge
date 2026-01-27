export type CacheKey = [string, ...unknown[]] | [string, string];

export interface ServerData {
  process: Date | null;
  server: Date;
  version: string;
}

export interface SyncData {
  offset: number;
  error: number;
}
