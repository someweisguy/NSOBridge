import TimeoutsLeft from "@/features/bouts/components/timeouts-left";
import { useSuspenseGetRuleset } from "@/hooks/use-ruleset";
import { Bout, Team } from "@/types/bout";
import { TeamJam } from "@/types/jam";
import { isRunning } from "@/utils/time";
import { Flex, Grid, GridProps, Paper, px, Text, Title } from "@mantine/core";
import { IconStarFilled, IconStarOff } from "@tabler/icons-react";
import useSuspenseActiveJam from "../hooks/use-active-jam";
import useLatestTimeout from "../hooks/use-latest-timeout";

const jammerStatusIconSize = "1rem";

export interface TeamScoreProps extends GridProps {
  bout: Bout;
  team: Team;
  reverse?: boolean;
}

export default function TeamScore({
  bout,
  team,
  reverse = false,
  ...props
}: TeamScoreProps) {
  const { data: activeJam } = useSuspenseActiveJam(bout);
  const { data: latestTimeout } = useLatestTimeout(bout);
  const { data: ruleset } = useSuspenseGetRuleset({
    rulesetName: bout.rulesetName,
  });

  const teamJam = activeJam.teamJams.find(
    (teamJam: TeamJam) => team.uuid == teamJam.teamUuid,
  );
  const lead = teamJam?.events.some((event) => event.lead) ?? false;
  const lost = teamJam?.events.some((event) => event.lost) ?? false;
  const starPass = teamJam?.events.some((event) => event.starPass) ?? false;
  const initial =
    teamJam?.events.some((event) => event.passes != null) ?? false;

  return (
    <Grid justify="space-around" align="last baseline" w="100%" {...props}>
      <Grid.Col span={12}>
        <Title ta="center" fz="h3">
          {team.name}
        </Title>
      </Grid.Col>
      <Grid.Col
        span={3}
        align="center"
        style={{ alignSelf: "center", placeItems: "center" }}
        order={reverse ? 12 : 1}
      >
        <TimeoutsLeft
          timeoutIsActive={
            latestTimeout != null &&
            isRunning(latestTimeout) &&
            latestTimeout.teamUuid === team.uuid
          }
          isReview={latestTimeout?.isReview ?? false}
          h="4rem"
          {...team}
          {...ruleset}
        />
      </Grid.Col>
      <Grid.Col span={4} order={2}>
        <Text fz="3rem" ta="center">
          {team.boutScore + team.scoreOffset}
        </Text>
      </Grid.Col>
      <Grid.Col span={3} order={reverse ? 1 : 12}>
        <Flex justify="start" align="center" direction="column-reverse" gap="0">
          <Paper
            withBorder
            fz="2rem"
            w="3rem"
            ta="center"
            style={{ aspectRatio: "1/1" }}
          >
            {initial ? team.jamScore : "-"}
          </Paper>
          {starPass ? (
            <Text fw="500" size={jammerStatusIconSize}>
              SP
            </Text>
          ) : lost ? (
            <IconStarOff size={px(jammerStatusIconSize)} />
          ) : lead ? (
            <IconStarFilled size={px(jammerStatusIconSize)} />
          ) : (
            <></>
          )}
        </Flex>
      </Grid.Col>
    </Grid>
  );
}
