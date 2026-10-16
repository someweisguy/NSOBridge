import { useSuspenseGetRuleset } from "@/hooks/game/use-ruleset";
import { Bout, Team } from "@/types/bout";
import { Stack, StackProps } from "@mantine/core";
import { useTeamJamOperator } from "../hooks/use-team-jam-operator";
import JammerController from "./jammer-controller";
import TeamScore from "./team-score";
import TripAdder from "./trip-adder";
import TripController from "./trip-controller";

export interface TeamJamOperatorProps extends StackProps {
  bout: Bout; // TODO: replace with bout.activeJamUuid
  team: Team;
  reverse?: boolean;
}

export default function TeamJamOperator({
  bout,
  team,
  reverse = false,
  ...props
}: TeamJamOperatorProps) {
  const { data: ruleset } = useSuspenseGetRuleset({
    rulesetName: bout.rulesetName,
  });

  const { teamJam, leadIsDeclared, jammerInitial, jammerState, timeoutType } =
    useTeamJamOperator(bout, team);

  return (
    <Stack justify="start" align="center" {...props}>
      <TeamScore
        name={team.name}
        boutScore={team.boutScore}
        scoreOffset={team.scoreOffset}
        jamScore={team.jamScore}
        timeoutsRemaining={team.timeoutsRemaining}
        reviewsRemaining={team.reviewsRemaining}
        timeout={timeoutType ?? null}
        jammerState={jammerState}
        jammerInitial={jammerInitial}
        numTimeouts={ruleset.numTimeouts}
        numReviews={ruleset.numReviews}
        reverse={reverse}
      />
      <JammerController
        team={team}
        jammerState={jammerState}
        leadIsDeclared={leadIsDeclared}
        disabled={teamJam == null}
        justify="space-between"
        mx="md"
      />
      <TripAdder
        team={team}
        pointsPerTrip={ruleset.pointsPerTrip}
        px="lg"
        w="100%"
      />
      <TripController
        teamIsInThisJam={teamJam != null}
        tripEvents={teamJam?.events ?? []}
        pointsPerTrip={ruleset.pointsPerTrip}
        draggable={false}
        w="22rem"
        h="4rem"
      />
    </Stack>
  );
}
