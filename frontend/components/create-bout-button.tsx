import { useCreateBout } from "@/hooks/use-create-bout";
import { Button, Group, Modal, Select } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { useEffect, useState } from "react";

interface CreateBoutButtonProps {
  rulesetNames: string[];
}

export default function CreateBoutButton({
  rulesetNames,
}: CreateBoutButtonProps) {
  const [opened, { open, close }] = useDisclosure(false);
  const [rulesetName, setRulesetName] = useState<string>(rulesetNames[0]);
  const createBout = useCreateBout({
    rulesetName,
    onSuccess: close,
  });

  useEffect(() => {
    if (rulesetName == null && rulesetNames.length > 0) {
      setRulesetName(rulesetName[0]);
    }
  }, [rulesetNames, rulesetName]);

  return (
    <>
      <Modal title="Create a New Bout" opened={opened} onClose={close} centered>
        <Group justify="center" align="end">
          <Select
            label="New Bout Ruleset"
            placeholder="Derby Ruleset"
            data={rulesetNames}
            value={rulesetName}
            onChange={(value: string | null) => setRulesetName(value!)}
            loading={rulesetNames == null}
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
      </Modal>
      <Button onClick={open}>Create New Bout</Button>
    </>
  );
}
