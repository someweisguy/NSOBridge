import { onlineManager } from "@tanstack/react-query";
import { useEffect, useState } from "react";

export const useConnection = (): boolean => {
  const [isOnline, setIsOnline] = useState(onlineManager.isOnline());

  useEffect(() => {
    return onlineManager.subscribe((onlineState) => {
      setIsOnline(onlineState);
    });
  }, []);

  return isOnline;
};
