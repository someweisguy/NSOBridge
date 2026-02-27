import { Button, ButtonProps } from "@mantine/core";

interface OpenScoreboardButtonProps extends Omit<ButtonProps, "onClick"> {
  boutUuid: string;
}

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
