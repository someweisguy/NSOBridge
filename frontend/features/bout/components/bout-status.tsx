import Clock from "@/components/clock";
import JamClock from "@/components/jam-clock";
import JamNumber from "@/components/jam-number";
import PeriodClock from "@/components/period-clock";
import { useSuspenseJam } from "@/hooks/use-jam";
import { useTimeout } from "@/hooks/use-timeout";
import { Bout } from "@/lib/game/bouts";
import { BoutContext } from "@/utils/contexts";
import { Center, Grid, GridProps, Text, TextProps } from "@mantine/core";
import { ReactNode, useContext } from "react";

const defaultPrimaryLabels = {
  Pregame: ({ size }: TextProps) => <Text size={size}>Pregame</Text>,
  Halftime: ({ size }: TextProps) => <Text size={size}>Halftime</Text>,
  Unofficial: ({ size }: TextProps) => <Text size={size}>Unofficial</Text>,
  Final: ({ size }: TextProps) => <Text size={size}>Final</Text>,
};

interface SecondaryLabelProps extends TextProps {
  content: string;
  countUpTimestamp?: Date | null;
}

const defaultSecondaryLabels = {
  Lineup: ({ content, countUpTimestamp, size }: SecondaryLabelProps) => (
    <Text size={size}>
      {content + (content.trim().length > 0 ? " " : "")}
      <Clock startTimestamp={countUpTimestamp ?? null} />
    </Text>
  ),
  Timeout: ({ content, countUpTimestamp, size }: SecondaryLabelProps) => (
    <Text size={size}>
      {content + (content.trim().length > 0 ? " " : "")}
      <Clock startTimestamp={countUpTimestamp ?? null} />
    </Text>
  ),
  postTimeout: <></>,
};

interface PrimaryBoutStatusProps
  extends Pick<GridProps, "align">,
    Pick<TextProps, "size"> {
  Labels?: typeof defaultPrimaryLabels;
}

interface SecondaryBoutStatusProps
  extends Pick<GridProps, "align">,
    Pick<TextProps, "size"> {
  Labels?: typeof defaultSecondaryLabels;
}

export default function PrimaryBoutStatus({
  Labels,
  align,
  size,
}: PrimaryBoutStatusProps) {
  const bout: Bout | null = useContext(BoutContext);
  if (bout == null) {
    throw new Error("PrimaryBoutStatus must be used within a BoutProvider");
  }

  Labels = { ...defaultPrimaryLabels, ...Labels };

  // Render the Bout status in a single column if the Bout is stopped
  if (bout.state == "stopped") {
    let stoppedNode: ReactNode;
    if (bout.isFinal) {
      stoppedNode = <Labels.Final size={size} />;
    } else if (bout.jamCounts[2] > 0) {
      stoppedNode = <Labels.Unofficial size={size} />;
    } else if (bout.jamCounts[1] > 0) {
      stoppedNode = <Labels.Halftime size={size} />;
    } else {
      stoppedNode = <Labels.Pregame size={size} />;
    }
    return <Center>{stoppedNode}</Center>;
  }

  return (
    <Grid grow columns={3} justify="space-around" align={align}>
      <Grid.Col span={1}>
        <Center>
          <PeriodClock size={size} />
        </Center>
      </Grid.Col>
      <Grid.Col span={1}>
        <Center>
          <JamNumber size={size} />
        </Center>
      </Grid.Col>
      <Grid.Col span={1}>
        <Center>
          <JamClock size={size} />
        </Center>
      </Grid.Col>
    </Grid>
  );
}

export function SecondaryBoutStatus({
  Labels,
  size,
}: SecondaryBoutStatusProps) {
  const bout: Bout | null = useContext(BoutContext);
  if (bout == null) {
    throw new Error("SecondaryBoutStatus must be used within a BoutProvider");
  }
  const [currentPeriodNum, currentJamNum] = bout.getActiveOrLatestJamNum();
  const { data: activeJam } = useSuspenseJam(
    bout,
    currentPeriodNum,
    currentJamNum,
  );
  const { data: latestTimeout, isPending } = useTimeout(
    bout,
    bout.timeoutCount - 1,
    {
      enabled: bout.timeoutCount > 0,
      initialData: null,
    },
  );

  Labels = { ...defaultSecondaryLabels, ...Labels };
  console.log(latestTimeout);
  console.log(currentJamNum);

  switch (bout.state) {
    case "lineup":
      if (
        latestTimeout != null &&
        latestTimeout.periodNum == currentPeriodNum &&
        latestTimeout.jamNum == currentJamNum
      ) {
        // Timeout was just called off
        return (
          <Labels.Lineup
            content={latestTimeout.isReview ? "Post-review" : "Post-timeout"}
            countUpTimestamp={latestTimeout.stopTimestamp}
            size={size}
          />
        );
      } else {
        return (
          <Labels.Lineup
            content="Lineup"
            countUpTimestamp={activeJam.stopTimestamp}
            size={size}
          />
        );
      }
    case "timeout":
      if (latestTimeout?.isReview) {
        return (
          <Labels.Timeout
            content="Official Review"
            countUpTimestamp={latestTimeout.startTimestamp}
            size={size}
          />
        );
      } else {
        if (
          isPending ||
          (!latestTimeout?.teamIsOfficials && latestTimeout?.teamNum == null)
        ) {
          return (
            <Labels.Timeout
              content="Timeout"
              countUpTimestamp={
                isPending ? null : latestTimeout?.startTimestamp
              }
              size={size}
            />
          );
        } else if (latestTimeout?.teamIsOfficials) {
          return (
            <Labels.Timeout
              content="Official Timeout"
              countUpTimestamp={latestTimeout.startTimestamp}
              size={size}
            />
          );
        } else {
          return (
            <Labels.Timeout
              content="Team Timeout"
              countUpTimestamp={latestTimeout?.startTimestamp}
              size={size}
            />
          );
        }
      }
    default:
      return <></>;
  }
}
