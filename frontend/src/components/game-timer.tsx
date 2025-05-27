import { BoutIdContext } from "@/app/provider";
import useBout, {
  selectActiveJamId,
  selectClockIsRunning,
  selectLatestJamId,
} from "@/hooks/use-bout";
import { useContext } from "react";
import Clock from "./clock";

interface TimerViewProps {
  boutId?: string;
}

export default function GameTimer({ boutId }: TimerViewProps) {
  const [boutIdContext] = useContext(BoutIdContext);
  boutId ??= boutIdContext;

  const isInLineup: boolean = useBout(boutId, selectClockIsRunning("lineup"));

  // Get the active or latest Jam ID
  const activeJamId = useBout(boutId, selectActiveJamId());
  const latestJamId = useBout(boutId, selectLatestJamId());
  const [periodNum, jamNum] = activeJamId ?? latestJamId;

  return (
    <div className="items-center gap-2 grid grid-flow-col p-1 border rounded-md w-fit text-xl">
      <div className="px-1 w-14 text-right">
        <Clock boutId={boutId} name="game" />
      </div>
      <div className="p-2 border-gray-200 border-x w-24 text-2xl text-center">
        P{periodNum + 1} {isInLineup ? "L" : "J"}
        {jamNum + 1}
      </div>
      <div className="px-1 w-12 text-right">
        <Clock
          boutId={boutId}
          name={isInLineup ? "lineup" : "jam"}
          showMillis={isInLineup ? false : "auto"}
        />
      </div>
    </div>
  );
}
