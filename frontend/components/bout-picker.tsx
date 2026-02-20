import { Bout } from "@/lib/game/bouts";
import { Select, SelectProps } from "@mantine/core";
import { useSuspenseGetAllBouts } from "../hooks/use-suspense-get-all-bouts";

export default function BoutPicker({
  onChange,
}: Omit<SelectProps, "allowDeselect" | "data" | "defaultValue">) {
  const { data: bouts } = useSuspenseGetAllBouts();

  const selectableData = bouts.map((bout: Bout) => ({
    value: bout.uuid,
    label: `${bout.teams[0].name} vs. ${bout.teams[1].name}`,
  }));

  return (
    <Select
      allowDeselect={false}
      data={selectableData}
      defaultValue={selectableData[selectableData.length - 1].value}
      onChange={onChange}
    />
  );
}
