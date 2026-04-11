import { BoutStateString } from "@/types/bout";
import { Button, ButtonProps } from "@mantine/core";

interface BoutJamControlProps extends ButtonProps {
  boutState: BoutStateString;
  onClick?:
    | ((event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void)
    | undefined;
}

/**
 * Control the Jam state of the desired Bout. This button is used to start and stop the
 * latest Jam of the Bout.
 */
export default function BoutJamControl({
  boutState,
  onClick,
  ...props
}: BoutJamControlProps) {
  const content = boutState == "jam" ? "Stop Jam" : "Start Jam";

  return (
    <Button onClick={onClick} {...props}>
      {content}
    </Button>
  );
}
