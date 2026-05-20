import { Button, Group, Stack, TextInput } from "@mantine/core";
import { useMask } from "@mantine/hooks";
import { useEffect, useState } from "react";
import { useSetBoutClockRemaining } from "../hooks/use-set-bout-clock-remaining";

interface BoutClockEditorProps {
  boutUuid: string;
}

export default function BoutClockEditor({ boutUuid }: BoutClockEditorProps) {
  const { ref, value } = useMask({
    mask: [/\d/, /\d/, ":", /[0-5]/, /\d/],
    slotChar: " ",
  });
  const [inputMilliseconds, setInputMilliseconds] = useState(0);

  const setBoutClockElapsed = useSetBoutClockRemaining({ boutUuid });

  useEffect(() => {
    const [minutes, seconds] = value
      .replace(/ /g, "0")
      .split(":")
      .map((val: string) => Number(val));

    setInputMilliseconds((minutes * 60 + seconds) * 1000);
  }, [value]);

  return (
    <Stack>
      <TextInput ref={ref} placeholder="mm:ss"></TextInput>
      <Group justify="flex-end">
        <Button onClick={() => setBoutClockElapsed.mutate(inputMilliseconds)}>
          Apply
        </Button>
      </Group>
    </Stack>
  );
}
