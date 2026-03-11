import { useSuspenseJam } from "@/hooks/use-suspense-jam";
import { TeamJam } from "@/lib/game/jams";
import { GroupProps } from "@mantine/core";
import JammerState from "../../../components/jammer-state";
import { useTeamJamAddLead } from "../hooks/use-team-jam-add-lead";
import { useTeamJamAddLost } from "../hooks/use-team-jam-add-lost";
import { useTeamJamAddStarPass } from "../hooks/use-team-jam-add-star-pass";

interface JammerStateEditorContainerProps extends GroupProps {
  boutUuid: string;
  periodNum: number;
  jamNum: number;
  teamNum: number;
}

export default function JammerStateEditorContainer({
  boutUuid,
  periodNum,
  jamNum,
  teamNum,
  ...props
}: JammerStateEditorContainerProps) {
  const { data: jam } = useSuspenseJam({ boutUuid, periodNum, jamNum });
  const teamJam: TeamJam | undefined = jam.teamJams.find(
    (tj) => tj.teamNum == teamNum,
  );
  if (teamJam == null) {
    throw new Error("Could not find this team in the Jam");
  }

  const setLead = useTeamJamAddLead({
    boutUuid,
    periodNum,
    jamNum,
    teamNum,
  });
  const setLost = useTeamJamAddLost({
    boutUuid,
    periodNum,
    jamNum,
    teamNum,
  });
  const setStarPass = useTeamJamAddStarPass({
    boutUuid,
    periodNum,
    jamNum,
    teamNum,
  });

  const lead = teamJam.events.some((tripEvent) => tripEvent.lead);
  const lost = teamJam.events.some((tripEvent) => tripEvent.lost);
  const starPass = teamJam.events.some((tripEvent) => tripEvent.starPass);

  // The Lead checkbox should be disabled if another team has lead
  let isLeadEligible = true;
  if (!lost) {
    for (const tj of jam.teamJams) {
      if (tj == teamJam) {
        continue;
      }
      for (const event of tj.events) {
        if (event.lead) {
          isLeadEligible = false;
          break;
        }
      }
      if (!isLeadEligible) {
        break;
      }
    }
  }

  return (
    <JammerState
      lead={lead}
      lost={lost}
      starPass={starPass}
      isLeadEligible={!lost && isLeadEligible}
      leadOnClick={setLead}
      lostOnClick={setLost}
      starPassOnClick={setStarPass}
      {...props}
    />
  );
}
