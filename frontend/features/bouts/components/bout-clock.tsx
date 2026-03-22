import Clock, { ClockProps } from "@/components/clock";
import { Button, Modal, Text, TextProps } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";

export interface BoutClockProps extends ClockProps, TextProps {
  /**
   * True if the Bout is in overtime.
   */
  isOvertime?: boolean;
  /**
   * The text to display instead of the Clock when the Bout is in overtime.
   */
  overtimeText?: string;
}

/**
 * Displays the current status of the desired Bout. Shows the Period Clock when the game
 * is running normally. When the Bout goes into overtime, an overtime label is
 * displayed.
 */
export default function BoutClock({
  isOvertime = false,
  overtimeText = "OT",
  ...props
}: BoutClockProps) {
  const [opened, { open, close }] = useDisclosure(false);

  return (
    <>
      <Text {...props}>
        <Button onClick={open} variant="subtle" c="default" size="xl">
          {isOvertime ? overtimeText : <Clock {...props} formatter="bout" />}
        </Button>
      </Text>
      <Modal title="Edit Period Clock" opened={opened} onClose={close} centered>
        Edit Period Clock
      </Modal>
    </>
  );
}
