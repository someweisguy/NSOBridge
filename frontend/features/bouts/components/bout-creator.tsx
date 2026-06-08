import { useCreateBout } from "@/features/bouts/hooks/use-create-bout";
import { Button, Group, Select } from "@mantine/core";
import { useState } from "react";

interface BoutCreatorProps {
  rulesetNames: string[];
  seriesUuid: string;
  onSuccess?: (newBoutUuid: string) => void;
}

export default function BoutCreator({
  seriesUuid,
  rulesetNames,
  onSuccess,
}: BoutCreatorProps) {
  const [rulesetName, setRulesetName] = useState<string>(rulesetNames[0] ?? "");
  const createBout = useCreateBout({
    rulesetName,
    seriesUuid,
    onSuccess,
  });

  return (
    <Group justify="center" align="end">
      <Select
        label="New Bout Ruleset"
        placeholder="Select an option..."
        data={rulesetNames}
        value={rulesetName}
        onChange={(value: string | null) => setRulesetName(value!)}
        loading={rulesetNames.length == 0}
        allowDeselect={false}
        autoSelectOnBlur
      />
      <Button
        onClick={() => createBout.mutate()}
        disabled={rulesetName == null}
      >
        Create
      </Button>
    </Group>
  );
}
