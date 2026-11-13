import { useSuspenseBout } from "@/hooks/use-bout";
import { useSuspenseRuleset } from "@/hooks/use-ruleset";
import { Team } from "@/types/bout";
import { TripEvent } from "@/types/jam";
import { Divider, Fieldset, Stack, StackProps } from "@mantine/core";
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
      <Fieldset px="0" pb="0">
        <Stack justify="space-between" align="center" gap="0">
          <JammerController
            teamUuid={team.uuid}
            jammerLead={jammerLead}
            jammerLost={jammerLost}
            jammerStarPass={jammerStarPass}
            leadIsDeclared={leadIsDeclared}
            disabled={teamJam == null || !jamHasStarted}
            justify="space-between"
            align="center"
            p="sm"
          />
          <TripAdder
            teamUuid={team.uuid}
            showInitial={!jammerInitial}
            pointsPerTrip={ruleset.pointsPerTrip}
            disabled={!jamHasStarted}
            px="lg"
            py="xs"
            w="100%"
          />
          <Divider w="100%" />
          <TripController
            teamIsInThisJam={teamIsInThisJam}
            jammerInitial={jammerInitial}
            draggable={false}
            w="22rem"
            h="4rem"
            m="xs"
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
      </Fieldset>
    </Stack>
  );
}
