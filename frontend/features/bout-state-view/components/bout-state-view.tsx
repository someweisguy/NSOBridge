import Clock from "@/components/clock";
import useRuleset from "@/hooks/use-ruleset";
import { Bout } from "@/types/game";
import useActiveJam from "../hooks/use-active-jam";
import IntermissionStateView from "./intermission-state-view";

export default function BoutStateView({ bout }: { bout: Bout }) {
  const ruleset = useRuleset(bout.id);
  const activeJam = useActiveJam(bout.id);

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

  return (
    <div className="justify-evenly grid grid-cols-3 text-7xl text-center">
      <div>{activeJam.period >= 2 ? "OT" : <Clock {...bout.clock} />}</div>
      <div>
        P{periodNum + 1} J{jamNum + 1}
      </div>
      <div>
        {/* TODO: This div should show the call reason when a Jam ends */}
        <Clock {...activeJam} alarm={ruleset.jamDuration} />
      </div>

      {/* TODO: This div is for Lineup, Timeout, Unofficial, and Final*/}
      <div className="col-start-2 text-5xl"> </div>
    </div>
  );
}
