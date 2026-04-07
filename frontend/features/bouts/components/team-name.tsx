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
  /**
   * The Team Name to display.
   */
  teamName: string;
  /**
   * A mutator which tells the server to rename the team.
   */
  setTeamName?: UseMutationResult<void, unknown, string>;
  /**
   * True to make this component editable.
   */
  editable?: boolean;
}

/**
 * Display an editable version of a Team's Name.
 */
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
          <Group align="end" justify="center">
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
      <Text style={{ cursor: "pointer" }} {...props} onClick={open}>
        {teamName}
      </Text>
    </>
  );
}
