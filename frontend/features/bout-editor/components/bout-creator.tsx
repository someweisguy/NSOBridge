import { useCreateBout } from "@/features/bout-editor/hooks/use-create-bout";
import { useGetAllRulesets } from "@/hooks/game/use-ruleset";
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
  onSuccess?: (bout: Bout) => void;
}

// TODO: docs
export default function BoutCreator({
  activeSeries,
  onSuccess,
}: BoutCreatorProps) {
  const [opened, { open, close }] = useDisclosure(false);

  const { data: rulesetNames } = useGetAllRulesets<string[]>({
    select: (rulesets: Ruleset[]) => rulesets.map((ruleset) => ruleset.name),
  });

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
