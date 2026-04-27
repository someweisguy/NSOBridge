import {
  Button,
  Group,
  Modal,
  Text,
  TextInput,
  TextProps,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { useState } from "react";
import { useSetTeamName } from "../hooks/use-set-team-name";

interface TeamNameProps extends TextProps {
  /**
   * The Team Name to display.
   */
  name: string;
  uuid: string;
  num: number;
  /**
   * True to make this component editable.
   */
  editable?: boolean;
}

/**
 * Display an editable version of a Team's Name.
 */
export default function TeamName({
  uuid,
  num,
  name,
  editable = true,
  ...props
}: TeamNameProps) {
  const [opened, { open, close }] = useDisclosure(false);
  const [teamNameState, setTeamNameState] = useState(name);

  const setTeamName = useSetTeamName({ boutUuid: uuid, teamNum: num });

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
            <Button onClick={() => setTeamName.mutate(teamNameState)}>
              Apply
            </Button>
          </Group>
        </Modal>
      )}
      <Text style={{ cursor: "pointer" }} {...props} onClick={open}>
        {name}
      </Text>
    </>
  );
}
