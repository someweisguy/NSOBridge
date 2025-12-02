import Clock from "@/components/clock";
import useRuleset from "@/hooks/use-ruleset";
import { Bout } from "@/types/game";
import useActiveJam from "@/hooks/use-active-jam";
import IntermissionStateView from "./intermission-state-view";
import useTimeout from "@/hooks/use-timeout";
import {
  jamTimeStringFormatter,
  periodTimeStringFormatter,
} from "@/utils/time-string-formatters";

export default function BoutStateView({ bout }: { bout: Bout }) {
  const ruleset = useRuleset(bout.id);
  const activeJam = useActiveJam(bout.id);
  const latestTimeout = useTimeout(bout.id, bout.numTimeouts - 1);

  if (!bout.isRunning) {
    return <IntermissionStateView bout={bout} />;
  }

  let periodNum = activeJam.period;
  let jamNum = activeJam.num;
  if (activeJam.period >= 2) {
    // Overtime Jams should be considered a continuation of the second half
    periodNum = 1;
    jamNum += bout.jamCounts[1];
  }

  // Render non-Jam Bout states
  let gameStopTimestamp: Date | null = null;
  let gameState = "";
  if (bout.state === "lineup" && activeJam.stopTimestamp != null) {
    gameState = "Lineup";
    gameStopTimestamp = activeJam.stopTimestamp;
  } else if (bout.state === "timeout") {
    gameState = "Timeout";
    gameStopTimestamp = latestTimeout!.startTimestamp;
  }
  // TODO: render additional non-Jam Bout states

  // Render Jam stop reason when Jam has ended
  let jamStopReason = "-";
  if (activeJam.stopReason != null) {
    switch (activeJam.stopReason) {
      case "called":
        jamStopReason = "Called";
        break;
      // TODO: render additional Jam stop reasons
    }
  }

  return (
    <div className="justify-evenly grid grid-cols-3 p-4 text-7xl text-center">
      <div>
        {activeJam.period >= 2 ? (
          "OT"
        ) : (
          <Clock {...bout.clock} formatter={periodTimeStringFormatter} />
        )}
      </div>
      <div>
        P{periodNum + 1} J{jamNum + 1}
      </div>
      <div>
        {!activeJam.hasStarted() || activeJam.isRunning() ? (
          <Clock
            {...activeJam}
            alarm={ruleset.jamDuration}
            formatter={jamTimeStringFormatter}
          />
        ) : (
          jamStopReason
        )}
      </div>

      {/* TODO: This div is for Lineup, Timeout, Unofficial, and Final*/}
      <div className="col-start-2 text-5xl">
        {gameState}&nbsp;
        {gameStopTimestamp && <Clock startTimestamp={gameStopTimestamp} />}
      </div>
    </div>
  );
}
