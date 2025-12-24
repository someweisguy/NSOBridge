export interface ServerInfo {
  process: Date | null;
  server: Date;
  version: string;
}

export interface ServerSynchronizationData {
  offset: number;
  error: number;
}
