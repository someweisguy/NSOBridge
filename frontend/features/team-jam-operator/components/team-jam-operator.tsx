import { useSuspenseBout } from "@/hooks/use-bout";
import { useSuspenseRuleset } from "@/hooks/use-ruleset";
import { Team } from "@/types/bout";
import { TripEvent } from "@/types/jam";
import { Stack, StackProps } from "@mantine/core";
import { useTeamJamOperator } from "../hooks/use-team-jam-operator";
import JammerController from "./jammer-controller";
import JammerTrip from "./jammer-trip";
import TeamScore from "./team-score";
import TripAdder from "./trip-adder";
import TripController from "./trip-controller";

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
  // TODO: get ruleset by Bout UUID, add ruleset as Table in database
  const { data: bout } = useSuspenseBout({ uuid: team.boutUuid });
  const { data: ruleset } = useSuspenseRuleset({
    rulesetName: bout.rulesetName,
  });

  const {
    teamJam,
    teamIsInThisJam,
    leadIsDeclared,
    jammerInitial,
    jammerState,
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
        teamIsInThisJam={teamIsInThisJam}
        jammerInitial={jammerInitial}
        draggable={false}
        w="22rem"
        h="4rem"
      >
        {teamJam?.events
          .filter((tripEvent) => tripEvent.passes != null)
          .map((tripEvent: TripEvent, i: number) => (
            <JammerTrip
              enableEdit
              enableDelete
              key={tripEvent.uuid}
              uuid={tripEvent.uuid}
              timestamp={tripEvent.timestamp}
              lead={tripEvent.lead}
              lost={tripEvent.lost}
              starPass={tripEvent.starPass}
              passes={tripEvent.passes}
              pointsPerTrip={ruleset.pointsPerTrip}
              tripIndex={i}
              w="4rem"
              h="3.5rem"
            />
          ))}
      </TripController>
    </Stack>
  );
}
