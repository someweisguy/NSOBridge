import { Button, ButtonProps } from "@mantine/core";

interface OpenScoreboardButtonProps extends Omit<ButtonProps, "onClick"> {
  /**
   * The UUID of the Bout which should be displayed on the Scoreboard.
   */
  boutUuid: string;
}

/**
 * Open a new tab of the Scoreboard page. The Bout that is displayed should be the Bout
 * as specified by the Bout UUID.
 */
export default function OpenScoreboardButton({
  boutUuid,
  ...props
}: OpenScoreboardButtonProps) {
  return (
    <Button
      onClick={() => window.open("sb?boutUuid=" + boutUuid, "_blank")}
      {...props}
    >
      Open Scoreboard
    </Button>
  );
}
