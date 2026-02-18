import { Bout } from "@/lib/game/bouts";
import { Select } from "@mantine/core";
import { useEffect, useState } from "react";
import { useSuspenseGetAllBouts } from "../hooks/use-suspense-get-all-bouts";

interface BoutPickerProps {
  onChange: (boutUUid: string) => void;
}

export default function BoutPicker({ onChange }: BoutPickerProps) {
  const { data: bouts } = useSuspenseGetAllBouts();

  const selectableData = bouts.map((bout: Bout) => ({
    value: bout.uuid,
    label: `${bout.teams[0].name} vs. ${bout.teams[1].name}`,
  }));

  const [selectedBoutUuid, setSelectedBoutUuid] = useState(
    selectableData[selectableData.length - 1].value,
  );

  useEffect(() => {
    onChange(selectedBoutUuid);
  }, [selectedBoutUuid, onChange]);

  return (
    <Select
      allowDeselect={false}
      data={selectableData}
      defaultValue={selectableData[selectableData.length - 1].value}
      onChange={(value: string | null) => setSelectedBoutUuid(value!)}
    />
  );
}
