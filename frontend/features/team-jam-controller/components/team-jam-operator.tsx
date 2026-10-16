import useSuspenseActiveJam from "@/hooks/game/use-active-jam";
import { useLatestJam } from "@/hooks/game/use-latest-jam";
import { useSuspenseGetRuleset } from "@/hooks/game/use-ruleset";
import { Bout, Team } from "@/types/bout";
import { Stack, StackProps } from "@mantine/core";
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
  const { data: activeJam } = useSuspenseActiveJam(bout);
  void useLatestJam(bout); // Prefetch to avoid UI blinking
  const { data: ruleset } = useSuspenseGetRuleset({
    rulesetName: bout.rulesetName,
  });

  return (
    <Stack justify="start" align="center" {...props}>
      <TeamScore bout={bout} team={team} reverse={reverse} />
      <JammerController
        justify="space-between"
        mx="md"
        jam={activeJam}
        team={team}
        {...ruleset}
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
