import { useSuspenseJam } from "@/hooks/use-jam";
import { Bout } from "@/lib/game/bouts";
import { JamContext } from "@/utils/contexts";
import { PropsWithChildren } from "react";

interface JamProviderProps extends PropsWithChildren {
  bout: Bout;
  periodNum: number;
  jamNum: number;
}

export default function JamProvider({
  bout,
  periodNum,
  jamNum,
  children,
}: JamProviderProps) {
  const { data: jam } = useSuspenseJam(bout, periodNum, jamNum);

  return <JamContext value={jam}>{children}</JamContext>;
}
