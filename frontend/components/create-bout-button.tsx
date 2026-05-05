import { useCreateBout } from "@/hooks/use-create-bout";
import { Button, ButtonProps, Group, Modal, Select } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { useEffect, useState } from "react";

interface CreateBoutButtonProps extends ButtonProps {
  /**
   * The ruleset names supported by the server.
   */
  rulesetNames: string[];
}

/**
 * Create a new Bout.
 *
 * Opens a modal which allows users to create Bouts.
 */
export default function CreateBoutButton({
  rulesetNames,
  ...props
}: CreateBoutButtonProps) {
  const [opened, { open, close }] = useDisclosure(false);
  const [rulesetName, setRulesetName] = useState<string>("");
  const createBout = useCreateBout({
    rulesetName,
    onSuccess: close,
  });

  useEffect(() => {
    if (rulesetName == "" && rulesetNames.length > 0) {
      setRulesetName(rulesetName[0]);
    }
  }, [rulesetNames, rulesetName]);

  return (
    <>
      <Modal title="Create a New Bout" opened={opened} onClose={close} centered>
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
      </Modal>
      <Button onClick={open} {...props}>
        Create New Bout
      </Button>
    </>
  );
}
