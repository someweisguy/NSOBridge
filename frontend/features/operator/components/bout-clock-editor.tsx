import { Button, Group, Stack, TextInput } from "@mantine/core";
import { useMask } from "@mantine/hooks";
import {
  IconPlayerPauseFilled,
  IconPlayerPlayFilled,
  IconStopwatch,
} from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { useSetBoutClockIsRunning } from "../hooks/use-set-bout-clock-is-running";
import { useSetBoutClockRemaining } from "../hooks/use-set-bout-clock-remaining";

interface BoutClockEditorProps {
  boutUuid: string;
  isRunning: boolean;
}

export default function BoutClockEditor({
  boutUuid,
  isRunning,
}: BoutClockEditorProps) {
  const { ref, value } = useMask({
    mask: [/\d/, /\d/, ":", /[0-5]/, /\d/],
    slotChar: " ",
  });
  const [inputMilliseconds, setInputMilliseconds] = useState(0);

  const setBoutClockElapsed = useSetBoutClockRemaining({ boutUuid });
  const setBoutClockIsRunning = useSetBoutClockIsRunning({ boutUuid });

  useEffect(() => {
    const [minutes, seconds] = value
      .replace(/ /g, "0")
      .split(":")
      .map((val: string) => Number(val));

    setInputMilliseconds((minutes * 60 + seconds) * 1000);
  }, [value]);

  return (
    <Stack>
      <TextInput
        ref={ref}
        placeholder="mm:ss"
        rightSection={<IconStopwatch size={16} />}
      ></TextInput>
      <Group justify="space-between">
        <Button
          variant="subtle"
          onClick={() => setBoutClockIsRunning.mutate(!isRunning)}
          leftSection={
            isRunning ? (
              <IconPlayerPauseFilled size={16} />
            ) : (
              <IconPlayerPlayFilled size={16} />
            )
          }
        >
          {isRunning ? "Pause Bout Clock" : "Start Bout Clock"}
        </Button>
        <Button onClick={() => setBoutClockElapsed.mutate(inputMilliseconds)}>
          Apply
        </Button>
      </Group>
    </Stack>
  );
}
