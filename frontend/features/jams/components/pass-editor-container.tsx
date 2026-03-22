import { useTeamJamAddTrip } from "@/features/jams/hooks/use-team-jam-add-trip";
import { useSuspenseBout } from "@/hooks/use-suspense-bout";
import { useSuspenseJam } from "@/hooks/use-suspense-jam";
import { useSuspenseRuleset } from "@/hooks/use-suspense-ruleset";
import { TeamJam } from "@/types/jam";
import { TeamJamUri } from "@/types/query";
import { GroupProps } from "@mantine/core";
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
  ...props
}: TeamJamUri & GroupProps) {
  const { data: bout } = useSuspenseBout({ boutUuid });
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

  const showInitial = teamJam.getNumTrips() == 0 && !bout.isOvertime();

  return (
    <PassEditor
      numPasses={ruleset.pointsPerTrip}
      showInitial={showInitial}
      addPassOnClick={addTrip}
      {...props}
    />
  );
}
