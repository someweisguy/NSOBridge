import {
  Card,
  Group,
  NumberInput,
  Stack,
  Text,
  useMantineTheme,
} from "@mantine/core";
import { useEffect, useRef, useState } from "react";

interface DurationPickerProps {
  label: string;
  description: string;
}

export default function DurationPicker({
  label,
  description,
}: DurationPickerProps) {
  const theme = useMantineTheme();
  const [minutes, setMinutes] = useState("");
  const [seconds, setSeconds] = useState("");
  const cardRef = useRef<HTMLInputElement>(null);
  const minutesRef = useRef<HTMLInputElement>(null);
  const secondsRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // TODO
  }, [minutes, seconds]);

  return (
    <Stack gap="1">
      <Text span lh="1.4" py="2" size="sm" fw="500" w="fit-content">
        {label}
      </Text>
      <Text p="0" my="0" lh="1" size="xs" c="dimmed">
        {description}
      </Text>
      <Card
        withBorder
        padding="0"
        m="0"
        mt="4"
        ref={cardRef}
        style={{ cursor: "text", borderColor: theme.colors.gray[4] }}
      >
        <Group
          onClick={(event) => {
            if (event.target != secondsRef.current) {
              minutesRef.current?.focus();
            }
          }}
          wrap="nowrap"
          gap="0"
          px="sm"
          py="0"
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
