import Clock from "@/components/clock";
import useRuleset from "@/hooks/use-ruleset";
import { Bout } from "@/types/game";
import useActiveJam from "../hooks/use-active-jam";

function IntermissionStatus({ bout }: { bout: Bout }) {
  const jam = useActiveJam(bout.id);

  let copy = "Starting Soon";
  if (bout.isFinal) {
    copy = "Final Score";
  } else if (jam.period > 1) {
    copy = "Unofficial Score";
  } else if (jam.period == 1) {
    copy = "Halftime";
  }

  return (
    <div className="items-center grid m-2 h-full text-8xl text-center">
      {copy}{" "}
      {bout.startCountdown && <Clock startTimestamp={bout.startCountdown} />}
    </div>
  );
}

export default function BoutStateView({ bout }: { bout: Bout }) {
  const ruleset = useRuleset(bout.id);
  const activeJam = useActiveJam(bout.id);

  if (!bout.isRunning) {
    return <IntermissionStatus bout={bout} />;
  }

  let displayPeriod = activeJam.period;
  let displayJam = activeJam.num;

  // Overtime Jams should be considered a continuation of the second half
  if (displayPeriod >= 2) {
    displayPeriod = 1;
    displayJam += bout.jamCounts[1];
  }

  // TODO: Period Clock, Period/Jam number, Jam/Lineup/Timeout/Post-Timeout Clock
  // TODO: Display Bout states: Jam, Timeout, Lineup, OT, Unofficial, Final
  return (
    <div className="flex justify-evenly items-center text-9xl text-center align-middle">
      <div className="bg-red w-full text-7xl text-center">
        {activeJam.period == 2 ? "OT" : <Clock {...bout.clock} />}
      </div>
      <div className="flex justify-between items-baseline gap-20 w-full">
        <h1 className="text-center">P{displayPeriod + 1}</h1>
        <h1 className="text-center">J{displayJam + 1}</h1>
      </div>
      <div className="w-full text-7xl text-center">
        {!activeJam.hasStarted() || activeJam.isRunning() ? (
          <Clock {...activeJam} alarm={ruleset.jamDuration} />
        ) : (
          <Clock
            startTimestamp={activeJam.stopTimestamp}
            alarm={ruleset.lineupDuration}
          />
        )}
      </div>
    </div>
  );
}
