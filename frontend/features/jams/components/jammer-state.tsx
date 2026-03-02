import {
  Checkbox,
  createTheme,
  Divider,
  Group,
  MantineProvider,
} from "@mantine/core";
import { IconStarFilled } from "@tabler/icons-react";

const checkBoxTheme = createTheme({
  cursorType: "pointer",
});

interface JammerStateProps {
  lead: boolean;
  lost: boolean;
  starPass: boolean;
  isLeadEligible: boolean;
  leadOnClick?: () => void;
  lostOnClick?: () => void;
  starPassOnClick?: () => void;
}

export default function JammerState({
  lead,
  lost,
  starPass,
  isLeadEligible,
  leadOnClick,
  lostOnClick,
  starPassOnClick,
}: JammerStateProps) {
  return (
    <Group justify="center" gap="md">
      <MantineProvider theme={checkBoxTheme}>
        <Checkbox
          label="Lead"
          checked={lead}
          disabled={lost || !isLeadEligible}
          onClick={leadOnClick}
          variant="outline"
          icon={({ ...others }) => <IconStarFilled {...others} />}
        />
        <Divider orientation="vertical" />
        <Checkbox
          label="Lost"
          checked={lost}
          onClick={lostOnClick}
          variant="outline"
        />
        <Divider orientation="vertical" />
        <Checkbox
          label="Star Pass"
          checked={starPass}
          onClick={starPassOnClick}
          variant="outline"
        />
      </MantineProvider>
    </Group>
  );
}
