import ClockView, { ClockProps } from "@/components/clock-view";
import DurationPicker from "@/components/duration-picker";
import {
  Button,
  Group,
  Modal,
  Stack,
  Switch,
  Text,
  TextProps,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { useCallback, useState } from "react";
import { useSetBoutClockElapsed } from "../hooks/use-set-bout-clock-elapsed";
import { useSetBoutClockIsRunning } from "../hooks/use-set-bout-clock-is-running";

export interface BoutClockProps extends ClockProps, TextProps {
  uuid: string;
  /**
   * True if the Bout is in overtime.
   */
  isOvertime?: boolean;
  /**
   * True if the user should be able to edit the Bout Clock from this component.
   */
  editable?: boolean;
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
  uuid,
  isOvertime = false,
  editable = false,
  overtimeText = "OT",
  ...props
}: BoutClockProps) {
  const [opened, { open, close }] = useDisclosure(false);
  const [timeValue, setTimeValue] = useState("");

  const resetModal = useCallback(() => setTimeValue(""), []);
  const setIsRunning = useSetBoutClockIsRunning({ boutUuid: uuid });
  const setElapsed = useSetBoutClockElapsed({
    boutUuid: uuid,
    onSuccess: close,
  });

  return (
    <>
      <Text style={{ cursor: "pointer" }} onClick={open} {...props}>
        {isOvertime ? overtimeText : <ClockView {...props} formatter="bout" />}
      </Text>

      {editable && (
        <Modal title="Edit Clock" opened={opened} onClose={resetModal} centered>
          <Stack w="full" justify="center" align="center">
            <Group w="full" wrap="nowrap" align="end" justify="center">
              <DurationPicker
                description="Set the Period Clock."
                w={200}
                onChange={(newValue) => setTimeValue(newValue)}
              />
              <Button
                onClick={() => {
                  const alarm = props.alarm ?? 0;
                  const [minutes, seconds] = timeValue
                    .split(":")
                    .map((i) => Number(i));
                  const milliseconds = (minutes * 60 + seconds) * 1000;
                  setElapsed?.mutate(alarm - milliseconds);
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
          </Stack>
        </Modal>
      )}
    </>
  );
}
