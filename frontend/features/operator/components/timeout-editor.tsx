import { useSuspenseBout } from "@/hooks/game/use-bout";
import { Team } from "@/types/bout";
import { Timeout } from "@/types/timeout";
import {
  ActionIcon,
  Button,
  Checkbox,
  Collapse,
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
  timeout: Timeout;
}

export default function TimeoutEditor({
  timeout,
  ...props
}: TimeoutEditorProps) {
  const { data: bout } = useSuspenseBout({ uuid: timeout.boutUuid });
  const { mutate: updateTimeout } = useUpdateTimeout(timeout.uuid);

  return (
    <Fieldset
      legend={"Edit " + (timeout.isReview ? "Official Review" : "Timeout")}
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
            value={timeout.isReview ? "review" : "timeout"}
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
          data={[
            {
              value: officialDataValue,
              label: "Officials",
              disabled: timeout.isReview,
            },
            ...bout.teams.map((team: Team) => ({
              value: team.uuid,
              label: team.name,
            })),
          ]}
          value={timeout.teamUuid ?? ""}
          onChange={(value: string | null) => {
            const valueIsOfficials = value == officialDataValue;
            if (valueIsOfficials) {
              updateTimeout({ teamUuid: null });
            } else {
              updateTimeout({ teamUuid: value });
            }
          }}
          error={timeout.isReview && timeout.teamIsOfficials}
          allowDeselect={false}
        />
        <Collapse expanded={timeout.isReview}>
          <Button
            w="100%"
            size="xs"
            variant="default"
            onClick={() => updateTimeout({ retained: !timeout.retained })}
          >
            <Checkbox
              w="100%"
              size="xs"
              label="Review is retained?"
              labelPosition="left"
              checked={timeout.retained}
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
