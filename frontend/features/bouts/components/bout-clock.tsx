import Clock, { ClockProps } from "@/components/clock";
import { Button, Group, Modal, Switch, Text, TextProps } from "@mantine/core";
import { TimePicker } from "@mantine/dates";
import { useDisclosure } from "@mantine/hooks";
import { UseMutationResult } from "@tanstack/react-query";
import { useCallback, useState } from "react";

export interface BoutClockProps extends ClockProps, TextProps {
  /**
   * True if the Bout is in overtime.
   */
  isOvertime?: boolean;
  /**
   * True if the user should be able to edit the Bout Clock from this component.
   */
  editable?: boolean;
  /**
   * Mutator which sets the amount of time on the Bout Clock.
   */
  setElapsed?: UseMutationResult<void, unknown, number>;
  /**
   * Mutator which pauses and starts the Bout Clock.
   */
  setIsRunning?: UseMutationResult<void, unknown, boolean>;
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
  editable = false,
  setElapsed,
  setIsRunning,
  overtimeText = "OT",
  ...props
}: BoutClockProps) {
  const [opened, { open, close }] = useDisclosure(false);
  const [timeValue, setTimeValue] = useState("");

  const closeModal = useCallback(() => {
    setTimeValue("");
    close();
  }, [close]);

  return (
    <>
      <Text {...props}>
        <Button onClick={open} variant="subtle" c="black" size="xl">
          {isOvertime ? overtimeText : <Clock {...props} formatter="bout" />}
        </Button>
      </Text>

      {editable && (
        <Modal
          title="Edit Period Clock"
          opened={opened}
          onClose={closeModal}
          centered
        >
          <Group>
            <TimePicker
              // FIXME: TimePicker does not work as a component
              withSeconds
              hoursPlaceholder="00"
              data-autofocus
              value={timeValue}
              onChange={(newValue) => setTimeValue(newValue)}
            />
            <Button
              onClick={() => {
                console.log(timeValue);
                const alarm = props.alarm ?? 0;
                const [hours, minutes, seconds] = timeValue
                  .split(":")
                  .map((i) => Number(i));
                const milliseconds =
                  ((hours * 60 + minutes) * 60 + seconds) * 1000;
                setElapsed?.mutate(alarm - milliseconds);
                closeModal();
              }}
            >
              Apply
            </Button>
          </Group>
          <Switch
            label="Run the Period Clock"
            checked={props.startTimestamp != null}
            onChange={(event) =>
              setIsRunning?.mutate(event.currentTarget.checked)
            }
          />
        </Modal>
      )}
    </>
  );
}
