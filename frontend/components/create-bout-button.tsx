import { useAllRulesetNames } from "@/hooks/use-all-ruleset-names";
import { Button, Modal, Select } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { useEffect, useState } from "react";

export default function CreateBoutButton() {
  const [opened, { open, close }] = useDisclosure(false);
  const { data: rulesetNames } = useAllRulesetNames({ placeholderData: [] });

  const [rulesetName, setRulesetName] = useState<string | null>(null);

  useEffect(() => {
    // Set the
    if (rulesetName == null && rulesetNames != null) {
      setRulesetName(rulesetNames[0]);
    }
  }, [rulesetName, rulesetNames]);

  return (
    <>
      <Modal title="Create a New Bout" opened={opened} onClose={close} centered>
        <Select
          label="New Bout Ruleset"
          placeholder="Derby Ruleset"
          data={rulesetNames}
          value={rulesetName}
          onChange={(value: string | null) => setRulesetName(value)}
          loading={rulesetNames == null}
          allowDeselect={false}
          autoSelectOnBlur
        />
        <Button
        // TODO: add button hooks
        >
          Create
        </Button>
      </Modal>
      <Button onClick={open}>Create New Bout</Button>
    </>
  );
}
