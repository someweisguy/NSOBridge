import { BoutStateString } from "@/types/bout";
import { Text, TextProps } from "@mantine/core";
import { useEffect, useState } from "react";

interface BoutStatusProps {
  state: BoutStateString;
  jamCounts: number[];
  isReview?: boolean;
  teamNum?: number | null;
  teamIsOfficials?: boolean;
  lastEvent?: "jam" | "timeout" | "review";
}

export default function BoutStatus({
  state,
  jamCounts,
  isReview,
  teamNum,
  teamIsOfficials,
  lastEvent,
  ...props
}: BoutStatusProps & Omit<TextProps, "children">) {
  const [stateString, setStateString] = useState(() =>
    statusAlgorithm({
      state,
      jamCounts,
      isReview,
      teamNum,
      teamIsOfficials,
      lastEvent,
    }),
  );

  useEffect(() => {
    setStateString(
      statusAlgorithm({
        state,
        jamCounts,
        isReview,
        teamNum,
        teamIsOfficials,
        lastEvent,
      }),
    );
  }, [state, jamCounts, isReview, teamNum, teamIsOfficials, lastEvent]);

  return <Text {...props}>{stateString}</Text>;
}

const statusAlgorithm = ({
  state,
  jamCounts,
  // isReview,
  // teamNum,
  // teamIsOfficials,
}: BoutStatusProps) => {
  let content = "";
  if (state == "stopped") {
    if (jamCounts[2] > 0) {
      content = "Unofficial";
    } else if (jamCounts[1] > 0) {
      content = "Halftime";
    } else {
      content = "Pregame";
    }
  } else if (state == "jam") {
    content = "Jam";
  } else if (state == "lineup") {
    // TODO: Post-Timeout
    // TODO: Post-Review
    content = "Lineup";
  } else if (state == "timeout") {
    // TODO: Team Timeout
    // TODO: Official Timeout
    // TODO: Official Review
    content = "Timeout";
  } else if (state == "final") {
    content = "Final";
  }

  return content;
};
