import { Jam } from "@/lib/game/jams";
import { JamContext } from "@/utils/contexts";
import { Text, TextProps } from "@mantine/core";
import { useContext } from "react";

export default function JamStopReason({ ...props }: TextProps) {
  const jam: Jam | null = useContext(JamContext);
  if (jam == null) {
    throw new Error("JamStopReason must only be used in a JamProvider");
  }

  // Render the stop reason when the Jam has ended
  let stopReasonText = "-";
  if (jam.hasStarted() && !jam.isRunning()) {
    switch (jam?.stopReason) {
      case "called":
        stopReasonText = "Called";
        break;
      case "elapsed":
        stopReasonText = "Time";
        break;
      case "injury":
        stopReasonText = "Injury";
        break;
    }
  }

  return <Text {...props}>{stopReasonText}</Text>;
}
