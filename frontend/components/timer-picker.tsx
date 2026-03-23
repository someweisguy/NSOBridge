import {
  Card,
  Group,
  NumberInput,
  Stack,
  Text,
  useMantineTheme,
} from "@mantine/core";
import { TimePicker } from "@mantine/dates";
import { useRef, useState } from "react";

export default function TimerPicker() {
  const [minutes, setMinutes] = useState(0);
  const [seconds, setSeconds] = useState(0);

  const cardRef = useRef<HTMLInputElement>(null);
  const minutesRef = useRef<HTMLInputElement>(null);
  const secondsRef = useRef<HTMLInputElement>(null);

  const theme = useMantineTheme();

  return (
    <Stack>
      <Card
        withBorder
        padding="0"
        w="contain"
        m="0"
        ref={cardRef}
        style={{ cursor: "text", borderColor: theme.colors.gray[4] }}
      >
        <Group
          gap="0"
          w="fit"
          px="sm"
          py="0"
          onClick={(event) => {
            if (event.target != secondsRef.current) {
              minutesRef.current?.focus();
            }
          }}
        >
          <NumberInput
            onChange={(m) => {
              if (String(m).length >= 2 || Number(m) > 5) {
                secondsRef.current?.focus();
              }
              setMinutes(Number(m));
            }}
            prefix={minutes < 10 && minutes > 0 ? "0" : ""}
            placeholder="--"
            max={59}
            miw="17"
            variant="unstyled"
            allowNegative={false}
            allowDecimal={false}
            hideControls
            ref={minutesRef}
            onFocus={() =>
              (cardRef.current!.style.borderColor = theme.colors.blue[5])
            }
            onBlur={() =>
              (cardRef.current!.style.borderColor = theme.colors.gray[4])
            }
          />
          <Text
            c={minutes > 0 || seconds > 0 ? theme.colors.dark[9] : "dimmed"}
            pb="2"
            m="0"
            ta="center"
          >
            :
          </Text>
          <NumberInput
            onChange={(s) => setSeconds(Number(s))}
            prefix={seconds < 10 && seconds > 0 ? "0" : ""}
            placeholder="--"
            max={59}
            miw="17"
            variant="unstyled"
            allowNegative={false}
            allowDecimal={false}
            hideControls
            ref={secondsRef}
            onFocus={() =>
              (cardRef.current!.style.borderColor = theme.colors.blue[5])
            }
            onBlur={() =>
              (cardRef.current!.style.borderColor = theme.colors.gray[4])
            }
          />
        </Group>
      </Card>
      <TimePicker />
    </Stack>
  );
}
