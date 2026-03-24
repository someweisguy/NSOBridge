import {
  Card,
  CardProps,
  Group,
  MantineRadius,
  MantineSize,
  NumberInput,
  Stack,
  Text,
  useMantineTheme,
} from "@mantine/core";
import { useEffect, useRef, useState } from "react";

interface DurationPickerProps extends CardProps {
  /**
   * The title label for the component.
   */
  label?: string;
  /**
   * The description which appears by the component.
   */
  description?: string;
  /**
   * The change handler that fires whenever the user inputs a value in this component.
   * Output from this function is a string which is formatted "MM:SS".
   */
  onChange?: (value: string) => void;
  /**
   * The component size.
   */
  size?: (string & {}) | MantineSize | undefined;
  /**
   * The component radius.
   */
  radius?: MantineRadius | undefined;
  /**
   * Disable the component.
   */
  disabled?: boolean;
}

/**
 * An input for picking durations. This component is built to look very similar to the
 * TimePicker component. The difference between TimePicker and DurationPicker is that
 * DurationPicker is designed for durations, not time-of-day values. This component
 * should generally be used to manipulate timers and within this application.
 */
export default function DurationPicker({
  label = "",
  description = "",
  onChange,
  size = "sm",
  radius = "md",
  disabled = false,
  w,
}: DurationPickerProps) {
  const theme = useMantineTheme();
  const [minutes, setMinutes] = useState("");
  const [seconds, setSeconds] = useState("");
  const cardRef = useRef<HTMLInputElement>(null);
  const minutesRef = useRef<HTMLInputElement>(null);
  const secondsRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (onChange != undefined) {
      const value = `${minutes.padStart(2, "0")}:${seconds.padStart(2, "0")}`;
      onChange(value);
    }
  }, [minutes, seconds, onChange]);

  return (
    <Stack w={w} gap="1">
      {label && (
        <Text span lh="1.4" py="2" size="sm" fw="500" w="fit-content">
          {label}
        </Text>
      )}
      {description && (
        <Text p="0" mt="0" mb="4" lh="1" size="xs" c="dimmed">
          {description}
        </Text>
      )}
      <Card
        radius={radius}
        bg={disabled ? theme.colors.gray[2] : undefined}
        withBorder
        padding="0"
        m="0"
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
            size={size}
            disabled={disabled}
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
            placeholder="mm"
            miw="17"
            variant="unstyled"
            hideControls
            radius="none"
            ref={minutesRef}
          />
          <Text
            size={size}
            c={
              minutes.length || seconds.length ? theme.colors.dark[9] : "dimmed"
            }
            pb="2"
            m="0"
            w="fit-content"
            ta="center"
          >
            :
          </Text>
          <NumberInput
            disabled={disabled}
            size={size}
            value={seconds}
            onChange={(s) => setSeconds(s.toString().slice(-2))}
            max={59}
            onFocus={() =>
              (cardRef.current!.style.borderColor = theme.colors.blue[5])
            }
            onBlur={() => {
              setSeconds(seconds.slice(-2).padStart(2, "0"));
              cardRef.current!.style.borderColor = theme.colors.gray[4];
            }}
            clampBehavior="strict"
            allowNegative={false}
            allowDecimal={false}
            placeholder="ss"
            miw="17"
            variant="unstyled"
            hideControls
            radius="none"
            ref={secondsRef}
          />
        </Group>
      </Card>
    </Stack>
  );
}
