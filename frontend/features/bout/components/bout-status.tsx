import JamClock from "@/components/jam-clock";
import JamNumber from "@/components/jam-number";
import PeriodClock from "@/components/period-clock";
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

const defaultSecondaryLabels = {
  Lineup: ({ size }: TextProps) => <Text size={size}>Lineup</Text>,
  Timeout: ({ size }: TextProps) => <Text size={size}>Timeout</Text>,
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

  Labels = { ...defaultSecondaryLabels, ...Labels };

  switch (bout.state) {
    case "lineup":
      return <Labels.Lineup size={size} />;
    case "timeout":
      return <Labels.Timeout size={size} />;
    default:
      return <></>;
  }
}
