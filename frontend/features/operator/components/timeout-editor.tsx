import { TimeoutUri } from "@/types/query";
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
import { useEffect, useState } from "react";
import { useSetTimeoutRetained } from "../hooks/use-set-timeout-retained";
import { useSetTimeoutTeam } from "../hooks/use-set-timeout-team";
import { useSetTimeoutType } from "../hooks/use-set-timeout-type";

const officialDataValue = ""; // Cannot be the string representation of a number!

interface TimeoutEditorProps extends FieldsetProps {
  timeoutUri: TimeoutUri;
  teamNum: number | null;
  teamIsOfficials: boolean;
  isReview: boolean;
  isRetained: boolean;
  teamData: { value: string; label: string }[];
}

export default function TimeoutEditor({
  timeoutUri,
  teamNum,
  teamIsOfficials,
  isReview,
  isRetained,
  teamData,
  ...props
}: TimeoutEditorProps) {
  const [officialReviewError, setOfficialReviewError] = useState(
    teamIsOfficials && isReview,
  );
  useEffect(() => {
    setOfficialReviewError(teamIsOfficials && isReview);
  }, [teamIsOfficials, isReview]);

  // Reset the select value whenever rendering this component for a new Timeout
  const [selectValue, setSelectValue] = useState<string | null>(null);
  useEffect(() => {
    setSelectValue(
      teamIsOfficials
        ? officialDataValue
        : teamNum != null
          ? String(teamNum)
          : null,
    );
  }, [teamIsOfficials, teamNum, timeoutUri]);

  const setType = useSetTimeoutType(timeoutUri);
  const setTeam = useSetTimeoutTeam(timeoutUri);
  const setIsRetained = useSetTimeoutRetained(timeoutUri);

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
            onChange={(type: "timeout" | "review") => setType.mutate(type)}
          />
          <ActionIcon disabled>
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
              disabled: isReview,
            },
            ...teamData,
          ]}
          value={selectValue}
          onChange={(value: string | number | null) => {
            const valueIsOfficials = value == officialDataValue;
            setOfficialReviewError(valueIsOfficials && isReview);
            setTeam.mutate(valueIsOfficials ? null : Number(value));
          }}
          error={officialReviewError}
          allowDeselect={false}
        />
        <Collapse expanded={isReview}>
          <Button
            w="100%"
            size="xs"
            variant="default"
            onClick={() => setIsRetained.mutate(!isRetained)}
          >
            <Checkbox
              w="100%"
              size="xs"
              label="Review is retained?"
              labelPosition="left"
              checked={isRetained}
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
