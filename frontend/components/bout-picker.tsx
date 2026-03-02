import { Select, SelectProps } from "@mantine/core";

interface BoutPickerProps extends Omit<
  SelectProps,
  "allowDeselect" | "defaultValue"
> {
  /**
   * The Bout data that is available to be selected.
   */
  data: { value: string; label: string }[];
}

/**
 * A dropdown that allows the user to select a Bout.
 */
export default function BoutPicker({ data, onChange }: BoutPickerProps) {
  return (
    <Select
      allowDeselect={false}
      data={data}
      defaultValue={data[data.length - 1].value}
      onChange={onChange}
    />
  );
}
