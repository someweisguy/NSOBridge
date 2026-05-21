import TimeoutsLeft from "@/components/timeouts-left";
import { TripEvent } from "@/types/jam";
import { Card, Center, Divider, Grid, Stack, Text } from "@mantine/core";

interface TeamCardProps {
  uuid: string;
  num: number;
  /**
   * The team name to display
   */
  teamName: string;
  /**
   * True to reverse the Jam score and the Timeout counter. Defaults to false.
   */
  reverse?: boolean;
  /**
   * The maximum number of timeouts that a Team may have.
   */
  numTimeouts: number;
  /**
   * The maximum number of official reviews that a Team may have.
   */
  numReviews: number;
  /**
   * The number of timeouts that this Team has remaining.
   */
  timeoutsRemaining: number;
  /**
   * The number of official reviews that this Team has remaining.
   */
  reviewsRemaining: number;
  /**
   * True if this Team has called a Timeout or official review.
   */
  timeoutIsActive: boolean;
  /**
   * True if the active Timeout is an official review.
   */
  isReview?: boolean;
  /**
   * The Bout score for this Team.
   */
  boutScore: number;
  /**
   * The score offset for this Team.
   */
  scoreOffset: number;
  /**
   * The Jam score for this team.
   */
  jamScore: number;
  events?: TripEvent[];
}

/**
 * Display a Team card which shows relevant Team information.
 *
 * The display team information includes the team name, the number of timeout and
 * reviews that this Team has remaining, the Bout score, the Jam score, and the name
 * of this Team's Jammer in the active Jam.
 */
export default function TeamCard({
  teamName,
  reverse = false,
  numTimeouts,
  numReviews,
  timeoutsRemaining,
  reviewsRemaining,
  isReview,
  timeoutIsActive,
  boutScore,
  scoreOffset,
  jamScore,
  events,
}: TeamCardProps) {
  // const lead = events?.some((event) => event.lead) ?? false;
  // const lost = events?.some((event) => event.lost) ?? false;
  // const starPass = events?.some((event) => event.starPass) ?? false;
  const numTrips =
    events?.reduce<number>(
      (numTrips: number, event: TripEvent) =>
        (numTrips += Number(event.passes != null)),
      0,
    ) ?? 0;

  return (
    <Card withBorder bg="gray.0">
      <Stack>
        <Text ta="center" fw="bolder" size="26pt">
          {teamName}
        </Text>
        <Divider />
        <Grid justify="space-between" align="flex-end">
          <Grid.Col span="auto" align="center" order={reverse ? 3 : 1}>
            <Center>
              <TimeoutsLeft
                numTimeouts={numTimeouts}
                numReviews={numReviews}
                timeoutsRemaining={timeoutsRemaining}
                reviewsRemaining={reviewsRemaining}
                timeoutIsActive={timeoutIsActive}
                isReview={isReview ?? false}
                size={24}
              />
            </Center>
          </Grid.Col>
          <Grid.Col span={6} order={2}>
            <Center h="100%">
              <Text fw="bold" h="100%" w={250} ta="center" size="60pt">
                {boutScore + scoreOffset}
              </Text>
            </Center>
          </Grid.Col>
          <Grid.Col span="auto" order={reverse ? 1 : 3}>
            <Stack gap="md" justify="space-between">
              <Text ta="center" size="24pt">
                {/* TODO: Add Jammer state icon */}
                &nbsp;
              </Text>
              <Card withBorder p="xs">
                <Text ta="center" size="24pt">
                  {numTrips == 0 ? "-" : jamScore}
                </Text>
              </Card>
            </Stack>
          </Grid.Col>
        </Grid>
        <Divider />
        <Text fw="semi-bold" fs="italic" ta="center" py="sm" size="18pt">
          {/* TODO: Add Jammer name chip */}
          &nbsp;
        </Text>
      </Stack>
    </Card>
  );
}
