import { useCreateBout } from "@/features/bouts/hooks/use-create-bout";
import { Bout } from "@/types/bout";
import { Ruleset } from "@/types/ruleset";
import { Series } from "@/types/series";
import { Button, Group, Select } from "@mantine/core";
import { useEffect, useState } from "react";

interface BoutCreatorProps {
  series: Series | undefined;
  rulesets: Ruleset[] | undefined;
  onSuccess?: (newBout: Bout) => void;
}

export default function BoutCreatorForm({
  series,
  rulesets,
  onSuccess,
}: BoutCreatorProps) {
  const [rulesetNames, setRulesetNames] = useState(
    rulesets?.map((ruleset: Ruleset) => ruleset.name),
  );
  useEffect(() => {
    setRulesetNames(rulesets?.map((ruleset: Ruleset) => ruleset.name));
  }, [rulesets]);

  const [rulesetName, setRulesetName] = useState<string | null>(null);
  useEffect(() => {
    if (rulesetNames != null && rulesetNames.length > 0) {
      setRulesetName(rulesetNames[0]);
    }
  }, [rulesetNames]);

  const createBout = useCreateBout({
    rulesetName: rulesetName!,
    series: series,
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
        onClick={() => createBout.mutate()}
        disabled={series == null || rulesetName == null}
      >
        Create
      </Button>
    </Group>
  );
}
