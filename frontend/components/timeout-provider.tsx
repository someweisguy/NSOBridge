import { useSuspenseTimeout } from "@/hooks/use-timeout";
import { Bout } from "@/lib/game/bouts";
import { TimeoutContext } from "@/utils/contexts";
import { PropsWithChildren } from "react";

interface TimeoutProviderProps extends PropsWithChildren {
  bout: Bout;
  timeoutNum: number;
}

export default function TimeoutProvider({
  bout,
  timeoutNum,
  children,
}: TimeoutProviderProps) {
  const { data: timeout } = useSuspenseTimeout(bout, timeoutNum);

  return <TimeoutContext value={timeout}>{children}</TimeoutContext>;
}
