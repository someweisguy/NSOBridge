import { TimeoutUri } from "@/types/query";
import {
  ActionIcon,
  Button,
  Checkbox,
  Collapse,
  Fieldset,
  Group,
  MantineThemeOverride,
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

interface TimeoutEditorProps extends MantineThemeOverride {
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
}: TimeoutEditorProps) {
  const [officialReviewError, setOfficialReviewError] = useState(
    teamIsOfficials && isReview,
  );
  useEffect(() => {
    setOfficialReviewError(teamIsOfficials && isReview);
  }, [teamIsOfficials, isReview]);

  const setType = useSetTimeoutType(timeoutUri);
  const setTeam = useSetTimeoutTeam(timeoutUri);
  const setIsRetained = useSetTimeoutRetained(timeoutUri);

  return (
    <Fieldset
      legend={"Edit " + (isReview ? "Official Review" : "Timeout")}
      w="fit-content"
      h="fit-content"
    >
      <Stack>
        <Group align="center">
          <SegmentedControl
            size="xs"
            data={[
              { value: "timeout", label: "Timeout" },
              { value: "review", label: "Official Review" },
            ]}
            value={isReview ? "review" : "timeout"}
            onChange={(type: "timeout" | "review") => setType.mutate(type)}
          />
          <Select
            size="xs"
            placeholder="Select a team..."
            data={[
              {
                value: officialDataValue,
                label: "Officials",
                disabled: isReview,
              },
              ...teamData,
            ]}
            value={teamIsOfficials ? officialDataValue : String(teamNum)}
            onChange={(value: string | number | null) => {
              const valueIsOfficials = value == officialDataValue;
              setOfficialReviewError(valueIsOfficials && isReview);
              setTeam.mutate(valueIsOfficials ? null : Number(value));
            }}
            error={officialReviewError}
          />
          <Collapse expanded={isReview} orientation="horizontal">
            <Button size="xs" variant="default">
              <Checkbox
                size="xs"
                label="Review is retained?"
                labelPosition="left"
                checked={isRetained}
                styles={{
                  input: { cursor: "pointer" },
                  label: { cursor: "pointer" },
                }}
                onChange={(event) =>
                  setIsRetained.mutate(event.currentTarget.checked)
                }
              ></Checkbox>
            </Button>
          </Collapse>
          <ActionIcon disabled>
            <IconPencil size={16} />
          </ActionIcon>
        </Group>
      </Stack>
    </Fieldset>
  );
}
