import { BoutStateString } from "@/types/bout";
import { Button, ButtonProps } from "@mantine/core";

interface BoutTimeoutControlProps extends ButtonProps {
  boutState: BoutStateString;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
}

/**
 * Control the Timeout state of the desired Bout. This button starts and stops the
 * latest Timeout of the Bout.
 */
export default function BoutTimeoutControl({
  boutState,
  onClick,
  ...props
}: BoutTimeoutControlProps) {
  const content = boutState == "timeout" ? "End Timeout" : "Call Timeout";
  const disabled = boutState != "lineup" && boutState != "timeout";

  return (
    <Button disabled={disabled} onClick={onClick} {...props}>
      {content}
    </Button>
  );
}
