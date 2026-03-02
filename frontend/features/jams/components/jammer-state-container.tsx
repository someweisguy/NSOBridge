import { useSuspenseJam } from "@/hooks/use-suspense-jam";
import { TeamJam } from "@/lib/game/jams";
import { useTeamJamAddLead } from "../hooks/use-team-jam-add-lead";
import { useTeamJamAddLost } from "../hooks/use-team-jam-add-lost";
import { useTeamJamAddStarPass } from "../hooks/use-team-jam-add-star-pass";
import JammerState from "./jammer-state";
import { GroupProps } from "@mantine/core";

interface JammerStateEditorContainerProps extends GroupProps {
  boutUuid: string;
  periodNum: number;
  jamNum: number;
  teamJamNum: number;
}

export default function JammerStateEditorContainer({
  boutUuid,
  periodNum,
  jamNum,
  teamJamNum,
  ...props
}: JammerStateEditorContainerProps) {
  const { data: jam } = useSuspenseJam(boutUuid, periodNum, jamNum);
  const teamJam: TeamJam = jam.teamJams[teamJamNum];

  const setLead = useTeamJamAddLead(jam, teamJam);
  const setLost = useTeamJamAddLost(jam, teamJam);
  const setStarPass = useTeamJamAddStarPass(jam, teamJam);

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
      leadOnClick={() => setLead.mutate(!lead)}
      lostOnClick={() => setLost.mutate(!lost)}
      starPassOnClick={() => setStarPass.mutate(!starPass)}
      {...props}
    />
  );
}
