import JamClock from "@/components/jam-clock";
import JamNumber from "@/components/jam-number";
import PeriodClock from "@/components/period-clock";
import { Bout } from "@/lib/game/bouts";
import { BoutContext } from "@/utils/contexts";
import { Center, Grid, GridProps, Text, TextProps } from "@mantine/core";
import { ReactNode, useContext } from "react";

const DefaultFinal = ({ size }: TextProps) => <Text size={size}>Final</Text>;
const DefaultUnofficial = ({ size }: TextProps) => (
  <Text size={size}>Unofficial</Text>
);
const DefaultHalftime = ({ size }: TextProps) => (
  <Text size={size}>Halftime</Text>
);
const DefaultPregame = ({ size }: TextProps) => (
  <Text size={size}>Pre-Game</Text>
);

interface BoutStatusProps
  extends Pick<GridProps, "align">,
    Pick<TextProps, "size"> {
  labels?: {
    pregame?: ReactNode;
    halftime?: ReactNode;
    unofficial?: ReactNode;
    final?: ReactNode;
  };
}

export default function BoutStatus({ labels, align, size }: BoutStatusProps) {
  const bout: Bout | null = useContext(BoutContext);
  if (bout == null) {
    throw new Error("BoutStatus must be used within a BoutProvider");
  }

  // Render the Bout status in a single column if the Bout is stopped
  if (bout.state == "stopped") {
    let stoppedNode: ReactNode;
    if (bout.isFinal) {
      stoppedNode = labels?.final ?? <DefaultFinal size={size} />;
    } else if (bout.jamCounts[2] > 0) {
      stoppedNode = labels?.unofficial ?? <DefaultUnofficial size={size} />;
    } else if (bout.jamCounts[1] > 0) {
      stoppedNode = labels?.halftime ?? <DefaultHalftime size={size} />;
    } else {
      stoppedNode = labels?.pregame ?? <DefaultPregame size={size} />;
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
