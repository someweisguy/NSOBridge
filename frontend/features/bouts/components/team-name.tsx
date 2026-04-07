import {
  Button,
  Group,
  Modal,
  Text,
  TextInput,
  TextProps,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { UseMutationResult } from "@tanstack/react-query";
import { useState } from "react";

interface TeamNameProps extends TextProps {
  teamName: string;
  setTeamName?: UseMutationResult<void, unknown, string>;
  editable?: boolean;
}

export default function TeamName({
  teamName,
  editable = true,
  setTeamName,
  ...props
}: TeamNameProps) {
  const [opened, { open, close }] = useDisclosure(false);
  const [teamNameState, setTeamNameState] = useState(teamName);

  return (
    <>
      {editable && (
        <Modal title="Edit Team Name" opened={opened} onClose={close} centered>
          <Group>
            <TextInput
              description="New Team Name"
              value={teamNameState}
              onChange={(event) => setTeamNameState(event.currentTarget.value)}
            ></TextInput>
            <Button onClick={() => setTeamName?.mutate(teamNameState)}>
              Apply
            </Button>
          </Group>
        </Modal>
      )}
      <Text {...props} onClick={open}>
        {teamName}
      </Text>
    </>
  );
}
