import { useTeamJamAddTrip } from "@/features/jams/hooks/use-team-jam-add-trip";
import { useSuspenseJam } from "@/hooks/use-suspense-jam";
import { useSuspenseRuleset } from "@/hooks/use-suspense-ruleset";
import { TeamJam } from "@/lib/game/jams";
import { TeamJamUri } from "@/types/query";
import PassEditor from "./pass-editor";

/**
 * Display the buttons which users may use to add trips to the Jammer's Jam. Typically
 * on the initial pass, a special set of buttons is displayed to simplify the UI.
 * Otherwise, a set of buttons to add passes to a Trip is displayed.
 */
export default function TeamJamPassEditorContainer({
  boutUuid,
  periodNum,
  jamNum,
  teamNum,
}: TeamJamUri) {
  const { data: ruleset } = useSuspenseRuleset({ boutUuid });
  const { data: jam } = useSuspenseJam({ boutUuid, periodNum, jamNum });
  const teamJam: TeamJam | undefined = jam.teamJams.find(
    (tj) => tj.teamNum == teamNum,
  );
  if (teamJam == null) {
    throw new Error("Could not find this team in the Jam");
  }

  const addTrip = useTeamJamAddTrip({
    boutUuid,
    periodNum,
    jamNum,
    teamNum,
  });

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
