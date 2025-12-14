import { Team, Timeout } from "@/types/game";
import { SegmentedControl, Switch, Text } from "@mantine/core";

interface TimeoutButtonsProps {
  timeout: Timeout;
  teams: Team[];
}

export default function TimeoutButtons({ timeout }: TimeoutButtonsProps) {
  return (
    <>
      <Switch
        checked={timeout.isReview}
        withThumbIndicator={false}
        label="Official Review"
      />
      <div>
        <Text size="sm" fw={500} mb={3}>
          Calling Team
        </Text>
        <SegmentedControl data={["Home", "Officials", "Away"]} />
      </div>
      <Switch withThumbIndicator={false} label="Retained" />
    </>
  );
}
