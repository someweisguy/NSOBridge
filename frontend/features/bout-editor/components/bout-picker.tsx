import { ComboboxData, Select, SelectProps } from "@mantine/core";

export interface BoutPickerProps extends Omit<
  SelectProps,
  "data" | "loading" | "value" | "onChange"
> {
  activeBoutUuid: string | undefined;
  data: ComboboxData<string>;
  onChange: (boutUuid: string) => void;
}

/**
 * Render a Bout Picker interface.
 *
 * Allows the user to select which Bout with which to interface.
 *
 */
export default function BoutPicker({
  activeBoutUuid,
  data,
  onChange,
  ...props
}: BoutPickerProps) {
  return (
    <Select
      data={data}
      value={activeBoutUuid}
      allowDeselect={false}
      onChange={(boutUuid: string | null) => {
        if (boutUuid != null) {
          onChange(boutUuid);
        }
      }}
      loading={activeBoutUuid == null || data.length == 0}
      {...props}
    />
  );
}
