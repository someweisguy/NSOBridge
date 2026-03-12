import { JamUri } from "@/types/query";
import { TextProps } from "@mantine/core";
import JamNumber from "./jam-number";

/**
 * Display the Jam number of the specified Jam. Typically overtime Jams are displayed
 * as a continuation of the second period. This component ensures that overtime Jams
 * are displayed correctly.
 */
export default function JamNumberContainer({
  // boutUuid,
  periodNum,
  jamNum,
  ...props
}: JamUri & TextProps) {
  // TODO: useSuspenseBout and calculate value of OT jam numbers
  return <JamNumber periodNum={periodNum} jamNum={jamNum} {...props} />;
}
