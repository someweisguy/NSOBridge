import { Button, Group, Stack, TextInput } from "@mantine/core";
import { useMask } from "@mantine/hooks";
import { useEffect } from "react";
import { useSetBoutClockElapsed } from "../hooks/use-set-bout-clock-elapsed";

interface BoutClockEditorProps {
  boutUuid: string;
}

export default function BoutClockEditor({ boutUuid }: BoutClockEditorProps) {
  const { ref, value } = useMask({
    mask: [/\d/, /\d/, ":", /[0-5]/, /\d/],
    slotChar: " ",
  });

  const setBoutClock = useSetBoutClockElapsed({ boutUuid });

  useEffect(() => {
    console.log(value);
  }, [value]);

  return (
    <Stack>
      <TextInput ref={ref} placeholder="hh:mm"></TextInput>
      <Group justify="flex-end">
        <Button onClick={() => setBoutClock.mutate(0)}>Apply</Button>
      </Group>
    </Stack>
  );
}
