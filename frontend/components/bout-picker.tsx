import { Select, SelectProps } from "@mantine/core";

interface BoutPickerProps extends Omit<
  SelectProps,
  "allowDeselect" | "defaultValue"
> {
  data: { value: string; label: string }[];
}

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
