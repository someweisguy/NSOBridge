import TimeoutsLeft from "@/components/timeouts-left";
import { Flex, Grid, GridProps, Paper, px, Text, Title } from "@mantine/core";
import { IconStarFilled, IconStarOff } from "@tabler/icons-react";

const jammerStatusIconSize = "1rem";

export interface TeamScoreProps extends GridProps {
  name: string;
  boutScore: number;
  scoreOffset: number;
  jamScore: number;
  timeout: "timeout" | "review" | null;
  timeoutsRemaining: number;
  reviewsRemaining: number;
  jammerState: "lead" | "lost" | "starPass" | null;
  jammerInitial: boolean;
  numTimeouts: number;
  numReviews: number;

  reverse?: boolean;
}

export default function TeamScore({
  name,
  boutScore,
  scoreOffset,
  jamScore,
  timeout,
  timeoutsRemaining,
  reviewsRemaining,
  jammerState,
  jammerInitial,
  numTimeouts,
  numReviews,
  reverse = false,
  ...props
}: TeamScoreProps) {
  return (
    <Grid justify="space-around" align="last baseline" w="100%" {...props}>
      <Grid.Col span={12}>
        <Title ta="center" fz="h3">
          {name}
        </Title>
      </Grid.Col>
      <Grid.Col
        span={3}
        align="center"
        style={{ alignSelf: "center", placeItems: "center" }}
        order={reverse ? 12 : 1}
      >
        <TimeoutsLeft
          timeoutIsActive={timeout != null}
          // timeoutIsActive={
          //   latestTimeout != null &&
          //   isRunning(latestTimeout) &&
          //   latestTimeout.teamUuid === team.uuid
          // }
          isReview={timeout == "review"}
          h="4rem"
          timeoutsRemaining={timeoutsRemaining}
          reviewsRemaining={reviewsRemaining}
          numTimeouts={numTimeouts}
          numReviews={numReviews}
        />
      </Grid.Col>
      <Grid.Col span={4} order={2}>
        <Text fz="3rem" ta="center">
          {boutScore + scoreOffset}
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
            {jammerInitial ? jamScore : "-"}
          </Paper>
          {jammerState == "starPass" ? (
            <Text fw="500" size={jammerStatusIconSize}>
              SP
            </Text>
          ) : jammerState == "lost" ? (
            <IconStarOff size={px(jammerStatusIconSize)} />
          ) : jammerState == "lead" ? (
            <IconStarFilled size={px(jammerStatusIconSize)} />
          ) : (
            <></>
          )}
        </Flex>
      </Grid.Col>
    </Grid>
  );
}
