import { useSuspenseBout } from "@/hooks/game/use-bout";
import { Bout, Team } from "@/types/bout";
import {
  ActionIcon,
  Button,
  Checkbox,
  Collapse,
  ComboboxData,
  Fieldset,
  FieldsetProps,
  Group,
  SegmentedControl,
  Select,
  Stack,
} from "@mantine/core";
import { IconPencil } from "@tabler/icons-react";
import { useUpdateTimeout } from "../hooks/use-update-timeout";

const officialDataValue = ""; // Cannot be the string representation of a number!

interface TimeoutEditorProps extends FieldsetProps {
  timeoutUuid: string;
  boutUuid: string;
  isReview: boolean;
  teamIsOfficials: boolean;
  teamUuid: string | null;
  retained: boolean;
}

export default function TimeoutEditor({
  timeoutUuid,
  boutUuid,
  isReview,
  teamIsOfficials,
  teamUuid,
  retained,
  ...props
}: TimeoutEditorProps) {
  const { data: teams } = useSuspenseBout<ComboboxData<string>>({
    uuid: boutUuid,
    select: (bout: Bout) =>
      bout.teams.map((team: Team) => ({
        value: team.uuid,
        label: team.name,
      })),
  });
  const { mutate: updateTimeout } = useUpdateTimeout(timeoutUuid);

  return (
    <Fieldset
      legend={"Edit " + (isReview ? "Official Review" : "Timeout")}
      {...props}
    >
      <Stack align="flex-state">
        <Group
          gap="xs"
          justify="space-between"
          wrap="nowrap"
          preventGrowOverflow={false}
        >
          <SegmentedControl
            size="xs"
            data={[
              { value: "timeout", label: "Timeout" },
              { value: "review", label: "Official Review" },
            ]}
            value={isReview ? "review" : "timeout"}
            onChange={(type: "timeout" | "review") =>
              updateTimeout({ isReview: type == "review" })
            }
          />
          {/* // TODO: Unhide and implement Timeout notes editor. */}
          <ActionIcon hidden disabled>
            <IconPencil size={16} />
          </ActionIcon>
        </Group>
        <Select
          size="xs"
          placeholder="Select a calling team..."
          data={teams}
          value={teamUuid ?? ""}
          onChange={(value: string | null) => {
            const valueIsOfficials = value == officialDataValue;
            if (valueIsOfficials) {
              updateTimeout({ teamUuid: null });
            } else {
              updateTimeout({ teamUuid: value });
            }
          }}
          error={isReview && teamIsOfficials}
          allowDeselect={false}
        />
        <Collapse expanded={isReview}>
          <Button
            w="100%"
            size="xs"
            variant="default"
            onClick={() => updateTimeout({ retained: !retained })}
          >
            <Checkbox
              w="100%"
              size="xs"
              label="Review is retained?"
              labelPosition="left"
              checked={retained}
              styles={{
                input: { cursor: "pointer" },
                label: { cursor: "pointer" },
              }}
            ></Checkbox>
          </Button>
        </Collapse>
      </Stack>
    </Fieldset>
  );
}
