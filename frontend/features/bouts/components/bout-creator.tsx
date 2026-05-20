import { useCreateBout } from "@/hooks/use-create-bout";
import { Button, Group, Select } from "@mantine/core";
import { useState } from "react";

interface BoutCreatorProps {
  rulesetNames: string[];
}

export default function BoutCreator({ rulesetNames }: BoutCreatorProps) {
  const [rulesetName, setRulesetName] = useState<string>(rulesetNames[0] ?? "");
  const createBout = useCreateBout({
    rulesetName,
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
