import { useSuspenseBout } from "@/hooks/game/use-bout";
import { useSuspenseGetRuleset } from "@/hooks/game/use-ruleset";
import { Team } from "@/types/bout";
import { Stack, StackProps } from "@mantine/core";
import { useTeamJamOperator } from "../hooks/use-team-jam-operator";
import JammerController from "./jammer-controller";
import TeamScore from "./team-score";
import TripAdder from "./trip-adder";
import TripController from "./trip-controller";

export interface TeamJamOperatorProps extends StackProps {
  team: Team;
  reverse?: boolean;
}

export default function TeamJamOperator({
  team,
  reverse = false,
  ...props
}: TeamJamOperatorProps) {
  // TODO: get ruleset by Bout UUID, add ruleset as Table in database
  const { data: bout } = useSuspenseBout({ uuid: team.boutUuid });
  const { data: ruleset } = useSuspenseGetRuleset({
    rulesetName: bout.rulesetName,
  });

  const { teamJam, leadIsDeclared, jammerInitial, jammerState, timeoutType } =
    useTeamJamOperator(team);

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
        teamUuid={team.uuid}
        jammerState={jammerState}
        leadIsDeclared={leadIsDeclared}
        disabled={teamJam == null}
        justify="space-between"
        mx="md"
      />
      <TripAdder
        teamUuid={team.uuid}
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
