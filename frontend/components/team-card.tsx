import { Card, Flex, Grid, Stack, Text } from "@mantine/core";
import { IconStarFilled, IconStarOff } from "@tabler/icons-react";
import { ReactNode } from "react";

interface TeamCardProps {
  /**
   * True to reverse the Jam score and the Timeout counter. Defaults to false.
   */
  reverse?: boolean;
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
  aside?: ReactNode;
  lead: boolean;
  lost: boolean;
  starPass: boolean;

  textSize: number;
}

/**
 * Display a Team card which shows relevant Team information.
 *
 * The display team information includes the team name, the number of timeout and
 * reviews that this Team has remaining, the Bout score, the Jam score, and the name
 * of this Team's Jammer in the active Jam.
 */
export default function TeamCard({
  reverse = false,
  boutScore,
  scoreOffset,
  jamScore,
  lead,
  lost,
  starPass,
  aside,
  textSize,
}: TeamCardProps) {
  const headerSize = textSize * 3;

  // Arbitrary middle column width expression that appears reasonably good when
  // adjusting the column width throughout a range of textSizes.
  const middleColumnWidth = textSize < 21 ? headerSize * 1.61 : headerSize * 2;

  return (
    <Grid w="fit-content" justify="space-between" columns={5}>
      {aside && (
        <Grid.Col span={1} order={reverse ? 2 : 0}>
          <Flex
            h="100%"
            align="flex-end"
            justify={reverse ? "flex-end" : "flex-start"}
          >
            {aside}
          </Flex>
        </Grid.Col>
      )}
      <Grid.Col span={3} order={1} align={"flex-end"} w={middleColumnWidth}>
        <Text inline ta="center" pb="0" mb="0" fz={headerSize}>
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
            <>&nbsp;</>
          )}
          <Card withBorder p={textSize / 4}>
            <Text ta="center" fz={textSize} w={textSize * 1.5}>
              {jamScore}
            </Text>
          </Card>
        </Stack>
      </Grid.Col>
    </Grid>
  );
}
