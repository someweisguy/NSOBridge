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
import { useCallback } from "react";
import { useUpdateTimeout } from "../hooks/use-update-timeout";

const officialDataValue = ""; // Cannot be the string representation of a number!

interface TimeoutEditorProps extends FieldsetProps {
  timeoutUuid: string | undefined;
  isReview: boolean | undefined;
  teamIsOfficials: boolean | undefined;
  teamUuid: string | null | undefined;
  retained: boolean | undefined;
  teams: ComboboxData<string> | undefined;
}

// TODO: docs
export default function TimeoutEditor({
  timeoutUuid,
  isReview,
  teamIsOfficials,
  teamUuid,
  retained,
  teams,
  ...props
}: TimeoutEditorProps) {
  const { mutate: updateTimeout } = useUpdateTimeout(timeoutUuid ?? "");

  const selectOnChange = useCallback(
    (value: string | null) => {
      const valueIsOfficials = value == officialDataValue;
      if (valueIsOfficials) {
        updateTimeout({ teamUuid: null, teamIsOfficials: true });
      } else {
        updateTimeout({ teamUuid: value });
      }
    },
    [updateTimeout],
  );

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
          data={[
            {
              label: "Officials",
              value: officialDataValue,
              disabled: isReview,
            },
            ...((teams as { label: string; value: string }[] | undefined) ??
              []),
          ]}
          loading={teams === undefined}
          value={teamUuid ?? ""} // TODO: allow selecting officials
          onChange={selectOnChange}
          error={isReview && teamIsOfficials}
          allowDeselect={false}
        />
        <Collapse expanded={isReview ?? false}>
          <Button
            w="100%"
            size="xs"
            variant="default"
            disabled={retained == null}
            onClick={() => updateTimeout({ retained: !retained })}
          >
            <Checkbox
              w="100%"
              size="xs"
              label="Review is retained?"
              labelPosition="left"
              disabled={retained == null}
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
