import { Bout } from "@/types/bout";
import { Button, Group, NumberInput, Stack, TextInput } from "@mantine/core";
import { useState } from "react";
import { useUpdateBoutTeam } from "../hooks/use-update-bout-team";

interface TeamEditorFormProps {
  uuid: string;
  name: string;
  timeoutsRemaining: number;
  reviewsRemaining: number;
  numTimeouts: number;
  numReviews: number;
  onSuccess?: (bout: Bout) => void;
}

// TODO: docs
export default function TeamEditorForm({
  uuid,
  name,
  timeoutsRemaining,
  reviewsRemaining,
  numTimeouts,
  numReviews,
  onSuccess,
}: TeamEditorFormProps) {
  const [teamName, setTeamName] = useState(name);
  const { mutate: updateBoutTeam } = useUpdateBoutTeam(uuid, { onSuccess });

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
          value={timeoutsRemaining}
          onChange={(num) => updateBoutTeam({ timeoutsRemaining: Number(num) })}
          min={0}
          max={numTimeouts}
        />
        <NumberInput
          label="Reviews Remaining"
          value={reviewsRemaining}
          onChange={(num) => updateBoutTeam({ reviewsRemaining: Number(num) })}
          min={0}
          max={numReviews}
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
