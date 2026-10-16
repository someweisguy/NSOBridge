import { useCreateBout } from "@/features/bout-creator/hooks/use-create-bout";
import { Bout } from "@/types/bout";
import { Button, Group, Select } from "@mantine/core";
import { useEffect, useState } from "react";

interface BoutCreatorProps {
  seriesUuid: string | undefined;
  rulesetNames: string[] | undefined;
  onSuccess?: (newBout: Bout) => void;
}

export default function BoutCreatorForm({
  seriesUuid,
  rulesetNames,
  onSuccess,
}: BoutCreatorProps) {
  const [rulesetName, setRulesetName] = useState<string | null>(null);
  useEffect(() => {
    if (rulesetNames != null && rulesetNames.length > 0) {
      setRulesetName(rulesetNames[0]);
    }
  }, [rulesetNames]);

  const { mutate: createBout } = useCreateBout({
    seriesUuid: seriesUuid ?? "",
    rulesetName: rulesetName!,
    onSuccess,
  });

  return (
    <Group justify="center" align="end">
      <Select
        label="New Bout Ruleset"
        placeholder="Select an option..."
        data={rulesetNames}
        value={rulesetName}
        onChange={(value: string | null) => setRulesetName(value)}
        loading={rulesetNames == null || rulesetName == null}
        allowDeselect={false}
        autoSelectOnBlur
      />
      <Button
        onClick={() => createBout()}
        disabled={seriesUuid == null || rulesetName == null}
      >
        Create
      </Button>
    </Group>
  );
}
