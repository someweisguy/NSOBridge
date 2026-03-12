import { SyncData } from "@/types/ws";
import { createContext, useContext } from "react";

export const SyncDataProvider = createContext<SyncData | null>(null);

/**
 * Get the server sync data provided as a context. This value is used to ensure that all
 * clocks are synchronized between clients.
 *
 * @returns the Sync Data URI provided as a React Context.
 */
export const useSyncDataContext = (): SyncData | null => {
  const syncData: SyncData | null = useContext(SyncDataProvider);
  return syncData;
};
