import { Box, BoxProps, Center, StyleProp, Text } from "@mantine/core";
import { IconStarFilled, IconX } from "@tabler/icons-react";
import { ReactElement } from "react";

interface JammerStateProps extends BoxProps {
  lead: boolean;
  lost: boolean;
  starPass: boolean;
  leadComponent?: ReactElement;
  lostComponent?: ReactElement;
  starPassComponent?: ReactElement;
}

function fontSizeTransform(size: StyleProp<number | string>) {
  if (!isNaN(Number(size))) {
    size = Number(size) * 0.65;
  }
  return size;
}

/**
 * Used to display the Jammer's state at a glance. Displays whether the Jammer is the
 * lead jammer, has lost lead eligibility, or has successfully completed a Star Pass.
 */
export default function JammerState({
  lead,
  lost,
  starPass,
  w = 50,
  h = w,
  leadComponent = <IconStarFilled size="80%" />,
  lostComponent = <IconX size="100%" />,
  starPassComponent = (
    <Text fw={500} fz={fontSizeTransform(h)} ta="center" tt="uppercase">
      SP
    </Text>
  ),
}: JammerStateProps) {
  let renderComponent: ReactElement = <></>;
  if (starPass) {
    renderComponent = starPassComponent;
  } else if (lost) {
    renderComponent = lostComponent;
  } else if (lead) {
    renderComponent = leadComponent;
  }

  return (
    <Box w={w} h={h}>
      <Center h="100%" w="100%">
        {renderComponent}
      </Center>
    </Box>
  );
}
