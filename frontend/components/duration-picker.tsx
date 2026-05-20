import { TextInput, TextInputProps } from "@mantine/core";
import { useMask } from "@mantine/hooks";

/**
 * An input for picking durations. This component is built to look very similar to the
 * TimePicker component. The difference between TimePicker and DurationPicker is that
 * DurationPicker is designed for durations, not time-of-day values. This component
 * should generally be used to manipulate timers within this application.
 */
export default function DurationPicker({ ...props }: TextInputProps) {
  const { ref } = useMask({ mask: [/\d/, /\d/, ":", /[0-5]/, /\d/] });

  return <TextInput ref={ref} placeholder="hh:mm" {...props}></TextInput>;
}
