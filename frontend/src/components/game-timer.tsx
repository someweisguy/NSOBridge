import { BoutIdContext } from "@/app/provider";
import useAlarmEffect from "@/hooks/use-alarm-effect";
import useBout, {
  selectClock,
  selectClockIsRunning,
  selectLatestJamId,
} from "@/hooks/use-bout";
import { useContext, useState } from "react";
import CountDownClock from "./count-down-clock";
import CountUpClock from "./count-up-clock";

interface TimerViewProps {
  boutId?: string;
}

export default function GameTimer({ boutId }: TimerViewProps) {
  const [boutIdContext] = useContext(BoutIdContext);
  boutId ??= boutIdContext;

  const isInLineup: boolean = useBout(boutId, selectClockIsRunning("lineup"));
  const isInTimeout: boolean = useBout(boutId, selectClockIsRunning("timeout"));

  // Get the active or latest Jam ID
  const [periodNum, jamNum] = useBout(boutId, selectLatestJamId());

  // Update the appearance of the Lineup timer when five seconds are remaining
  const clock = useBout(boutId, selectClock("lineup"));
  const [fiveSeconds, setFiveSeconds] = useState(false);
  useAlarmEffect(() => {
    setFiveSeconds(true);
    return () => setFiveSeconds(false);
  }, [clock, clock.alarm - 5000]);

  return (
    <div className="items-center gap-2 grid grid-flow-col p-1 border rounded-md w-fit text-xl">
      <div className="px-1 w-14 text-right">
        <CountDownClock boutId={boutId} name="game" />
      </div>
      <div className="p-2 border-gray-200 border-x w-24 text-2xl text-center">
        P{periodNum + 1} {isInLineup ? "L" : "J"}
        {jamNum + 1}
      </div>
      <div
        data-emphasis={fiveSeconds && isInLineup && !isInTimeout}
        className="px-1 w-12 data-[emphasis=true]:font-bold text-right"
      >
        {isInTimeout ? (
          <CountUpClock boutId={boutId} name="timeout" />
        ) : (
          <CountDownClock
            boutId={boutId}
            name={isInLineup ? "lineup" : "jam"}
            showMillis={isInLineup ? "auto" : false}
          />
        )}
      </div>
    </div>
  );
}
