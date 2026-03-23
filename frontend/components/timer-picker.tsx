import {
  Card,
  Group,
  NumberInput,
  Stack,
  Text,
  useMantineTheme,
} from "@mantine/core";
import { useEffect, useRef, useState } from "react";

export default function TimerPicker() {
  const [minutes, setMinutes] = useState("");
  const [seconds, setSeconds] = useState("");

  const cardRef = useRef<HTMLInputElement>(null);
  const minutesRef = useRef<HTMLInputElement>(null);
  const secondsRef = useRef<HTMLInputElement>(null);

  const theme = useMantineTheme();

  useEffect(() => {
    // TODO
  }, [minutes, seconds]);

  return (
    <Stack>
      <Card
        withBorder
        padding="0"
        w="contain" // TODO
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
            value={minutes}
            onChange={(m) => {
              if (m.toString().length >= 2) {
                secondsRef.current?.focus();
              }
              setMinutes(m.toString().slice(-2));
            }}
            max={59}
            onFocus={() =>
              (cardRef.current!.style.borderColor = theme.colors.blue[5])
            }
            onBlur={() => {
              setMinutes(minutes.padStart(2, "0"));
              cardRef.current!.style.borderColor = theme.colors.gray[4];
            }}
            clampBehavior="strict"
            allowNegative={false}
            allowDecimal={false}
            placeholder="--"
            miw="17"
            variant="unstyled"
            hideControls
            ref={minutesRef}
          />
          <Text
            c={
              minutes.length || seconds.length ? theme.colors.dark[9] : "dimmed"
            }
            pb="2"
            m="0"
            ta="center"
          >
            :
          </Text>
          <NumberInput
            value={seconds}
            onChange={(s) => setSeconds(s.toString().slice(-2))}
            max={59}
            onFocus={() =>
              (cardRef.current!.style.borderColor = theme.colors.blue[5])
            }
            onBlur={() => {
              setSeconds(seconds.slice(-2));
              cardRef.current!.style.borderColor = theme.colors.gray[4];
            }}
            clampBehavior="strict"
            allowNegative={false}
            allowDecimal={false}
            placeholder="--"
            miw="17"
            variant="unstyled"
            hideControls
            ref={secondsRef}
          />
        </Group>
      </Card>
    </Stack>
  );
}
