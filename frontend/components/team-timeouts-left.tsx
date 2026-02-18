import PlainTimeoutsLeft from "@/components/plain-timeouts-left";
import { useTimeout } from "@/hooks/use-timeout";
import { Bout, Team } from "@/lib/game/bouts";
import { Ruleset } from "@/lib/game/ruleset";
import { BoutContext, RulesetContext, TeamContext } from "@/utils/contexts";
import { useContext } from "react";

interface TeamTimeoutsLeftProps {
  size: number;
}

export default function TeamTimeoutsLeft({ size }: TeamTimeoutsLeftProps) {
  const team: Team | null = useContext(TeamContext);
  const bout: Bout | null = useContext(BoutContext);
  const ruleset: Ruleset | null = useContext(RulesetContext);
  if (team == null) {
    throw new Error("TimeoutBar must be used within a TeamProvider");
  }
  if (bout == null || ruleset == null) {
    throw new Error("TimeoutBar must be used within a BoutProvider");
  }

  const {
    data: latestTimeout,
    isPending,
    isEnabled,
  } = useTimeout(bout, bout.timeoutCount - 1, {
    enabled: bout.timeoutCount > 0,
  });

  const timeoutIsActive =
    !isPending &&
    isEnabled &&
    latestTimeout?.teamNum == team.num &&
    latestTimeout?.isRunning();

  const isReview =
    !isPending && isEnabled && (latestTimeout?.isReview ?? false);

  return (
    <PlainTimeoutsLeft
      numTimeouts={ruleset.numTimeouts}
      numReviews={ruleset.numReviews}
      timeoutsRemaining={team.timeoutsRemaining}
      reviewsRemaining={team.reviewsRemaining}
      timeoutIsActive={timeoutIsActive}
      isReview={isReview}
      size={size}
    />
  );
}
