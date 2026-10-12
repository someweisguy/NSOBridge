import { onlineManager } from "@tanstack/react-query";
import { useEffect, useState } from "react";

/**
 * Used to determine if the client is connected to the server.
 *
 * @returns true if the client is connected to the scoreboard server.
 */
export const useConnection = (): boolean => {
  const [isOnline, setIsOnline] = useState(onlineManager.isOnline());

  useEffect(() => {
    return onlineManager.subscribe((onlineState) => {
      setIsOnline(onlineState);
    });
  }, []);

  return isOnline;
};
