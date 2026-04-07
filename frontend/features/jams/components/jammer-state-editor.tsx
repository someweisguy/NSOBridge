import {
  Checkbox,
  createTheme,
  Divider,
  Group,
  GroupProps,
  MantineProvider,
} from "@mantine/core";
import { IconStarFilled } from "@tabler/icons-react";
import { UseMutationResult } from "@tanstack/react-query";

const checkBoxTheme = createTheme({
  // Hovering over checkbox should change cursor
  cursorType: "pointer",
});

interface JammerStateProps extends GroupProps {
  /**
   * True if this team's Jammer is the lead Jammer.
   */
  lead: boolean;
  /**
   * True if this team's Jammer has explicitly lost lead Jammer eligibility.
   */
  lost: boolean;
  /**
   * True if this team's Jammer has successfully completed a Star Pass.
   */
  starPass: boolean;
  /**
   * True if this team's Jammer is still eligible for lead. This value would be false if
   * the other team's Jammer has been declared lead.
   */
  isLeadEligible: boolean;
  /**
   * The event handler which fires when clicking the lead checkbox.
   */
  leadOnClick?: UseMutationResult<void, unknown, boolean, unknown>;
  /**
   * The event handler which fires when clicking the lost checkbox.
   */
  lostOnClick?: UseMutationResult<void, unknown, boolean, unknown>;
  /**
   * The event handler which fires when clicking the star pass checkbox.
   */
  starPassOnClick?: UseMutationResult<void, unknown, boolean, unknown>;
}

/**
 * Displays and allows for editing of the Jammer's state. This shows whether the Jammer
 * has been declared lead, has lost eligibility for lead, or if a star pass has
 * occurred.
 */
export default function JammerStateEditor({
  lead,
  lost,
  starPass,
  isLeadEligible,
  leadOnClick,
  lostOnClick,
  starPassOnClick,
  ...props
}: JammerStateProps) {
  return (
    <MantineProvider theme={checkBoxTheme}>
      <Group {...props}>
        <Checkbox
          label="Lead"
          checked={lead}
          disabled={!isLeadEligible}
          onClick={() => leadOnClick?.mutate(!lead)}
          variant="outline"
          icon={({ ...others }) => <IconStarFilled {...others} />}
        />
        <Divider orientation="vertical" />
        <Checkbox
          label="Lost"
          checked={lost}
          onClick={() => lostOnClick?.mutate(!lost)}
          variant="outline"
        />
        <Divider orientation="vertical" />
        <Checkbox
          label="Star Pass"
          checked={starPass}
          onClick={() => starPassOnClick?.mutate(!starPass)}
          variant="outline"
        />
      </Group>
    </MantineProvider>
  );
}
