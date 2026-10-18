import { Clock } from "@/types/time";
import { isRunning } from "@/utils/time";
import { Button, Group, Stack, TextInput } from "@mantine/core";
import { useMask } from "@mantine/hooks";
import {
  IconPlayerPauseFilled,
  IconPlayerPlayFilled,
  IconStopwatch,
} from "@tabler/icons-react";
import { useMemo } from "react";
import { useUpdateBoutClock } from "../../bout-editor/hooks/use-update-bout-clock";

interface BoutClockEditorProps {
  uuid: string;
  clock: Clock;
}

export default function BoutClockEditor({ uuid, clock }: BoutClockEditorProps) {
  const { ref, value } = useMask({
    mask: [/\d/, /\d/, ":", /[0-5]/, /\d/],
    slotChar: " ",
  });

  const { mutate: updateBoutClock } = useUpdateBoutClock(uuid);

  // The number of milliseconds in the TextInput value
  const remaining = useMemo(() => {
    const [minutes, seconds] = value
      .replace(/ /g, "0")
      .split(":")
      .map((val: string) => Number(val));
    return (minutes * 60 + seconds) * 1000;
  }, [value]);

  return (
    <Stack>
      <TextInput
        ref={ref}
        label="Set Remaining Time"
        placeholder="mm:ss"
        rightSection={<IconStopwatch size={16} />}
      ></TextInput>
      <Group justify="space-between">
        <Button
          variant="subtle"
          onClick={() => updateBoutClock({ isRunning: !isRunning(clock) })}
          leftSection={
            isRunning(clock) ? (
              <IconPlayerPauseFilled size={16} />
            ) : (
              <IconPlayerPlayFilled size={16} />
            )
          }
        >
          {isRunning(clock) ? "Pause Bout Clock" : "Start Bout Clock"}
        </Button>
        <Button onClick={() => updateBoutClock({ remaining })}>Apply</Button>
      </Group>
    </Stack>
  );
}
