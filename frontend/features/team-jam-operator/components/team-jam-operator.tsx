import { useSuspenseJam } from "@/hooks/game/use-jam";
import { useSuspenseGetRuleset } from "@/hooks/game/use-ruleset";
import { useTimeout } from "@/hooks/game/use-timeout";
import { Bout, Team } from "@/types/bout";
import { Jam, TeamJam } from "@/types/jam";
import { Timeout } from "@/types/timeout";
import { isRunning } from "@/utils/time";
import { Stack, StackProps } from "@mantine/core";
import { useMemo } from "react";
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

  // Get information about the this Team's active TeamJam
  const { data: teamJam } = useSuspenseJam({
    uuid: bout.activeJamUuid,
    select: (activeJam: Jam) =>
      activeJam.teamJams.find(
        (teamJam: TeamJam) => team.uuid == teamJam.teamUuid,
      ),
  });
  const { data: leadIsDeclared } = useSuspenseJam({
    uuid: bout.activeJamUuid,
    select: (activeJam: Jam) =>
      activeJam.teamJams.some((teamJam) =>
        teamJam.events.some((event) => event.lead),
      ),
  });
  const jammerInitial = teamJam?.events.some((t) => t.passes != null) ?? false;
  const jammerState: "lead" | "lost" | "starPass" | null = useMemo(() => {
    if (teamJam?.events.some((event) => event.starPass)) {
      return "starPass";
    } else if (teamJam?.events.some((event) => event.lost)) {
      return "lost";
    } else if (teamJam?.events.some((event) => event.lead)) {
      return "lead";
    }
    return null;
  }, [teamJam?.events]);

  // Get the relevant Timeout information
  const { data: timeoutType } = useTimeout<"timeout" | "review" | null>({
    uuid: bout.timeoutUuids[bout.timeoutUuids.length - 1],
    enabled: bout.timeoutUuids.length > 0,
    select: (latestTimeout: Timeout) => {
      if (
        latestTimeout == null ||
        !isRunning(latestTimeout) ||
        latestTimeout.teamUuid != team.uuid
      ) {
        // Timeout only matters if it is running and was called by this Team!
        return null;
      }
      return latestTimeout.isReview ? "review" : "timeout";
    },
  });

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
