import { useTeamJamAddTrip } from "@/features/jams/hooks/use-team-jam-add-trip";
import { useSuspenseJam } from "@/hooks/use-suspense-jam";
import { useSuspenseRuleset } from "@/hooks/use-suspense-ruleset";
import { TeamJam } from "@/lib/game/jams";
import PassEditor from "./pass-editor";

interface TeamJamPassEditorProps {
  boutUuid: string;
  periodNum: number;
  jamNum: number;
  teamJamNum: number;
}

export default function TeamJamPassEditorContainer({
  boutUuid,
  periodNum,
  jamNum,
  teamJamNum,
}: TeamJamPassEditorProps) {
  const { data: ruleset } = useSuspenseRuleset(boutUuid);
  const { data: jam } = useSuspenseJam(boutUuid, periodNum, jamNum);
  const teamJam: TeamJam = jam.teamJams[teamJamNum];

  const addTrip = useTeamJamAddTrip(jam, teamJam);

  // TODO: don't show Initial during overtime
  const showInitial =
    teamJam.events.filter((tripEvent) => tripEvent.passes != null).length == 0;

  return (
    <PassEditor
      numPasses={ruleset.pointsPerTrip}
      showInitial={showInitial}
      addPassOnClick={addTrip}
    />
  );
}
