import { useSuspenseBout } from "@/hooks/use-suspense-bout";
import { BoutUri } from "@/types/query";
import { Button, ButtonProps } from "@mantine/core";
import { useStartTimeout } from "../hooks/use-start-timeout";
import { useStopTimeout } from "../hooks/use-stop-timeout";

/**
 * Control the Timeout state of the desired Bout. This button starts and stops the
 * latest Timeout of the Bout.
 */
export default function BoutTimeoutControl({
  boutUuid,
  ...props
}: BoutUri & Omit<ButtonProps, "onClick">) {
  const { data: bout } = useSuspenseBout({ boutUuid });
  const startTimeout = useStartTimeout({ boutUuid });
  const stopTimeout = useStopTimeout({ boutUuid });

  const content = bout.state == "timeout" ? "End Timeout" : "Call Timeout";
  const command = bout.state == "timeout" ? stopTimeout : startTimeout;
  const disabled = bout.state != "lineup" && bout.state != "timeout";

  return (
    <Button disabled={disabled} onClick={() => command.mutate()} {...props}>
      {content}
    </Button>
  );
}
