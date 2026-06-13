import { Box, Card, Flex, Grid, GridProps, Stack, Text } from "@mantine/core";
import { IconStarFilled, IconStarOff } from "@tabler/icons-react";
import { ReactNode } from "react";

interface TeamScoreProps extends Omit<GridProps, "columns"> {
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
  /**
   * The team's jammer has lead.
   */
  lead: boolean;
  /**
   * The team's jammer has lost lead eligibility.
   */
  lost: boolean;
  /**
   * The team's jammer has completed a star pass.
   */
  starPass: boolean;
  /**
   * True if the Jammer has not completed the initial pass.
   */
  noInitial: boolean;
  /**
   * True to reverse the Jam score and the Timeout counter. Defaults to false.
   */
  reverse?: boolean;
  /**
   * The size of the text (in pixels) in which the jam score should be rendered.
   */
  textSize: number;
  /**
   * The component to be rendered beside the bout score.
   */
  aside?: ReactNode;
}

/**
 * Display a TeamScore which includes the Bout score, the Jam score and additionally
 * a Jammer status icon, which indicates whether the Jammer is lead, has lost lead, or
 * has successfully completed a star pass.
 *
 * Also allows for an optional aside component to be displayed next to the Bout score.
 * Hint: the aside component is a great opportunity to display the team's TimeoutsLeft
 * component!
 */
export default function TeamScore({
  reverse = false,
  boutScore,
  scoreOffset,
  jamScore,
  lead,
  lost,
  starPass,
  noInitial,
  aside,
  textSize,
  justify = "space-between",
  ...props
}: TeamScoreProps) {
  const headerSize = textSize * 3;

  // Arbitrary middle column width expression that appears reasonably good when
  // adjusting the column width throughout a range of textSizes.
  const middleColumnWidth = textSize + textSize * 10;

  return (
    <Grid columns={5} justify={justify} {...props}>
      {aside && (
        <Grid.Col span={1} order={reverse ? 2 : 0}>
          <Flex h="100%" align="center" justify="center">
            {aside}
          </Flex>
        </Grid.Col>
      )}
      <Grid.Col align="flex-end" span={3} order={1} w={middleColumnWidth}>
        <Text inline ta="center" fz={headerSize}>
          {boutScore + scoreOffset}
        </Text>
      </Grid.Col>
      <Grid.Col
        h="100%"
        align="center"
        span={1}
        order={reverse ? 0 : 2}
        w={2.5 + "rem"}
      >
        <Stack justify="flex-end" align="center" gap={textSize / 2}>
          {starPass ? (
            <Text fw="500" size={textSize + "px"}>
              SP
            </Text>
          ) : lost ? (
            <IconStarOff size={textSize} />
          ) : lead ? (
            <IconStarFilled size={textSize} />
          ) : (
            <Box h={textSize} />
          )}
          <Card withBorder p={textSize / 4} mx={textSize / 4}>
            <Text ta="center" fz={textSize} w={textSize * 1.5}>
              {noInitial ? "-" : jamScore}
            </Text>
          </Card>
        </Stack>
      </Grid.Col>
    </Grid>
  );
}
