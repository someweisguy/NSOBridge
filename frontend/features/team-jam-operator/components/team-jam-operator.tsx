import { useSuspenseBout } from "@/hooks/use-bout";
import { useSuspenseRuleset } from "@/hooks/use-ruleset";
import { Team } from "@/types/bout";
import { Stack, StackProps } from "@mantine/core";
import { useTeamJamOperator } from "../hooks/use-team-jam-operator";
import JammerController from "./jammer-controller";
import TeamScore from "./team-score";

export interface TeamJamOperatorProps extends StackProps {
  team: Team;
  reverse?: boolean;
}

// TODO: docs
export default function TeamJamOperator({
  team,
  reverse = false,
  ...props
}: TeamJamOperatorProps) {
  const { data: bout } = useSuspenseBout({ uuid: team.boutUuid });
  const { data: ruleset } = useSuspenseRuleset({ uuid: bout.uuid });

  const {
    teamJam,
    teamIsInThisJam,
    jamHasStarted,
    leadIsDeclared,
    jammerLead,
    jammerLost,
    jammerStarPass,
    jammerInitial,
    timeoutType,
  } = useTeamJamOperator(team);

  return (
    <Stack justify="start" align="center" {...props}>
      <TeamScore
        name={team.name}
        boutScore={team.boutScore}
        scoreOffset={team.scoreOffset}
        jamScore={team.jamScore}
        timeoutsRemaining={team.timeoutsRemaining}
        reviewsRemaining={team.reviewsRemaining}
        timeout={timeoutType}
        jammerLead={jammerLead}
        jammerLost={jammerLost}
        jammerStarPass={jammerStarPass}
        jammerInitial={jammerInitial}
        numTimeouts={ruleset.numTimeouts}
        numReviews={ruleset.numReviews}
        reverse={reverse}
      />
      <JammerController
        teamUuid={team.uuid}
        teamIsInJam={teamIsInThisJam}
        jammerLead={jammerLead}
        jammerLost={jammerLost}
        jammerStarPass={jammerStarPass}
        jammerHasInitial={jammerInitial}
        jammerTripEvents={teamJam?.events ?? []}
        pointsPerTrip={ruleset.pointsPerTrip}
        disableLeadCheckbox={leadIsDeclared && !jammerLead}
        disabled={!jamHasStarted}
      />
    </Stack>
  );
}
