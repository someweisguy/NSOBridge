import TimeoutsLeft from "@/features/timeouts/components/timeouts-left";
import { useSuspenseBout } from "@/hooks/use-suspense-bout";
import { useSuspenseRuleset } from "@/hooks/use-suspense-ruleset";
import { useTimeout } from "@/hooks/use-timeout";
import { TeamUri } from "@/types/query";

/**
 * Display the number of Timeouts and Reviews that a Team has remaining in a vertical,
 * stoplight-style graph.
 */
export default function TimeoutsLeftContainer({
  boutUuid,
  teamNum,
  size,
}: TeamUri & { size: number }) {
  const { data: bout } = useSuspenseBout({ boutUuid });
  const { data: ruleset } = useSuspenseRuleset({ boutUuid });
  const team = bout.teams.find((t) => t.num == teamNum);
  if (team == null) {
    throw new Error("Invalid Team number");
  }

  const {
    data: latestTimeout,
    isPending,
    isEnabled,
  } = useTimeout({
    ...bout.getLatestTimeoutUri(),
    enabled: bout.timeoutCount > 0,
  });

  const timeoutIsActive =
    !isPending &&
    isEnabled &&
    latestTimeout?.teamNum == teamNum &&
    latestTimeout?.isRunning();

  const isReview =
    !isPending && isEnabled && (latestTimeout?.isReview ?? false);

  return (
    <TimeoutsLeft
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
