import { Team } from "@/types/bout";
import { Button, Group, NumberInput, Stack, TextInput } from "@mantine/core";
import { useState } from "react";
import { useUpdateBoutTeam } from "../hooks/use-update-bout-team";

interface TeamEditorProps {
  team: Team;
  onSuccess?: (data: unknown, newTeamName: string) => void;
}

export default function TeamEditor({
  team,
  // onSuccess,
}: TeamEditorProps) {
  const [teamName, setTeamName] = useState(team.name);
  const { mutate: updateBoutTeam } = useUpdateBoutTeam(team.uuid);

  return (
    <Stack gap="md">
      <TextInput
        label="Team Name"
        value={teamName}
        onChange={(event) => setTeamName(event.currentTarget.value)}
      />
      <Group>
        {/* TODO: Prevent network requests when the min/max is reached */}
        <NumberInput
          label="Timeouts Remaining"
          value={team.timeoutsRemaining}
          onChange={(num) => updateBoutTeam({ timeoutsRemaining: Number(num) })}
          min={0}
          // max={ruleset.numTimeouts}  // FIXME
        />
        <NumberInput
          label="Reviews Remaining"
          value={team.reviewsRemaining}
          onChange={(num) => updateBoutTeam({ reviewsRemaining: Number(num) })}
          min={0}
          // max={ruleset.numReviews}  // FIXME
        />
      </Group>

      <Group justify="flex-end">
        <Button onClick={() => updateBoutTeam({ name: teamName })}>
          Apply
        </Button>
      </Group>
    </Stack>
  );
}
