import { Bout } from "@/types/bout";
import { Select, SelectProps } from "@mantine/core";

/**
 * Render a Bout Picker interface.
 *
 * Allows the user to select which Bout with which to interface.
 *
 */
export default function BoutPicker({
  activeBout,
  bouts,
  onChange,
  ...props
}: {
  activeBout: Bout | undefined;
  bouts: Bout[] | undefined;
  onChange: (bout: Bout) => void;
} & Omit<SelectProps, "data" | "loading" | "value" | "onChange">) {
  return (
    <Select
      data={
        bouts
          ?.filter((b) => b != null)
          .map((b) => ({
            value: b.uuid,
            label: b.teams.map((t) => t.name).join(" vs. "),
          })) ?? []
      }
      value={activeBout?.uuid}
      allowDeselect={false}
      onChange={(boutUuid: string | null) => {
        const bout: Bout | undefined = bouts?.find(
          (bout: Bout) => bout.uuid == boutUuid,
        );
        if (bout != null) {
          onChange(bout);
        }
      }}
      loading={activeBout == null || bouts?.length == 0}
      {...props}
    />
  );
}
