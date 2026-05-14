import { Stack, TextInput } from "@mantine/core";
import { useState } from "react";

interface TeamEditorProps {
  name: string;
}

export default function TeamEditor({ name }: TeamEditorProps) {
  const [teamName, setTeamName] = useState(name);

  return (
    <Stack>
      <TextInput
        label="Team Name"
        value={teamName}
        onChange={(event) => setTeamName(event.currentTarget.value)}
      />
    </Stack>
  );
}
