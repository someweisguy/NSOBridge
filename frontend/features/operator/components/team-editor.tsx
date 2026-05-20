import { Button, Group, Stack, TextInput } from "@mantine/core";
import { useState } from "react";
import { useSetTeamName } from "../hooks/use-set-team-name";

interface TeamEditorProps {
  boutUuid: string;
  num: number;
  name: string;
  onSuccess?: (data: unknown, newTeamName: string) => void;
}

export default function TeamEditor({
  boutUuid,
  num,
  name,
  onSuccess,
}: TeamEditorProps) {
  const [teamName, setTeamName] = useState(name);

  const useTeamName = useSetTeamName({ boutUuid, teamNum: num, onSuccess });

  return (
    <Stack gap="md">
      <TextInput
        label="Team Name"
        value={teamName}
        onChange={(event) => setTeamName(event.currentTarget.value)}
      />

      <Group justify="flex-end">
        <Button onClick={() => useTeamName.mutate(teamName)}>Apply</Button>
      </Group>
    </Stack>
  );
}
