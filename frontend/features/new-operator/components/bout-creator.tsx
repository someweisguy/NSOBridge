import { useCreateBout } from "@/features/bouts/hooks/use-create-bout";
import { Bout } from "@/types/bout";
import { Ruleset } from "@/types/ruleset";
import { Series } from "@/types/series";
import {
  ActionIcon,
  Button,
  Group,
  Modal,
  Select,
  Tooltip,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconPlus } from "@tabler/icons-react";
import { useEffect, useState } from "react";

export interface BoutCreatorProps {
  activeSeries: Series | undefined;
  rulesets: Ruleset[] | undefined;
  onSuccess?: (bout: Bout) => void;
}

export default function BoutCreator({
  activeSeries,
  rulesets,
  onSuccess,
}: BoutCreatorProps) {
  const [opened, { open, close }] = useDisclosure(false);

  // Get a list of acceptable ruleset names
  const [rulesetNames, setRulesetNames] = useState<string[] | undefined>(
    undefined,
  );
  useEffect(() => {
    setRulesetNames(rulesets?.map((ruleset: Ruleset) => ruleset.name));
  }, [rulesets]);

  // Set the selected Ruleset name
  const [selectedRulesetName, setSelectedRulesetName] = useState<string | null>(
    null,
  );
  useEffect(() => {
    if (rulesetNames != null && rulesetNames.length > 0) {
      setSelectedRulesetName(rulesetNames[0]);
    }
  }, [rulesetNames]);

  const { mutate: createBout } = useCreateBout({
    rulesetName: selectedRulesetName!,
    series: activeSeries,
    onSuccess: (bout: Bout) => {
      onSuccess?.(bout);
      close();
    },
  });

  return (
    <>
      <Tooltip withArrow fz="xs" label="Create a Bout">
        <ActionIcon variant="light" onClick={open}>
          <IconPlus size={16} />
        </ActionIcon>
      </Tooltip>
      <Modal title="Create New Bout" opened={opened} onClose={close}>
        <Group justify="center" align="end">
          <Select
            label="New Bout Ruleset"
            placeholder="Select an option..."
            data={rulesetNames}
            value={selectedRulesetName}
            onChange={(value: string | null) => setSelectedRulesetName(value)}
            loading={rulesetNames == null || selectedRulesetName == null}
            allowDeselect={false}
            autoSelectOnBlur
          />
          <Button
            onClick={() => createBout()}
            disabled={activeSeries == null || selectedRulesetName == null}
          >
            Create
          </Button>
        </Group>
      </Modal>
    </>
  );
}
