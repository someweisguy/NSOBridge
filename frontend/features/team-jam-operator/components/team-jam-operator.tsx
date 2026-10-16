import useSuspenseActiveJam from "@/hooks/game/use-active-jam";
import { useSuspenseJam } from "@/hooks/game/use-jam";
import useLatestTimeout from "@/hooks/game/use-latest-timeout";
import { useSuspenseGetRuleset } from "@/hooks/game/use-ruleset";
import { Bout, Team } from "@/types/bout";
import { Jam, TeamJam } from "@/types/jam";
import { isRunning } from "@/utils/time";
import { Stack, StackProps } from "@mantine/core";
import { useMemo } from "react";
import JammerController from "./jammer-controller";
import TeamScore from "./team-score";
import TripAdder from "./trip-adder";
import TripController from "./trip-controller";

export interface TeamJamOperatorProps extends StackProps {
  bout: Bout;
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

  const { data: latestTimeout } = useLatestTimeout(bout);
  const { data: activeJam } = useSuspenseActiveJam(bout);
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

  const initial = teamJam?.events.some((t) => t.passes != null) ?? false;
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

  const timeoutType: "timeout" | "review" | null = useMemo(() => {
    if (
      latestTimeout == null ||
      !isRunning(latestTimeout) ||
      latestTimeout.teamUuid != team.uuid
    ) {
      return null;
    }
    return latestTimeout.isReview ? "review" : "timeout";
  }, [latestTimeout, team.uuid]);

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
        jammerInitial={initial}
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
      <TripAdder team={team} px="lg" w="100%" {...ruleset} />
      <TripController
        jam={activeJam}
        team={team}
        draggable={false}
        w="22rem"
        h="4rem"
        {...ruleset}
      />
    </Stack>
  );
}
