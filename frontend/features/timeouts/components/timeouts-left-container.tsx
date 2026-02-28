import TimeoutsLeft from "@/features/timeouts/components/timeouts-left";
import { useSuspenseRuleset } from "@/hooks/use-suspense-ruleset";
import { useTimeout } from "@/hooks/use-timeout";

interface TimeoutsLeftContainerProps {
  boutUuid: string;
  teamNum: number;
  timeoutCount: number;
  timeoutsRemaining: number;
  reviewsRemaining: number;
  size: number;
}

export default function TimeoutsLeftContainer({
  boutUuid,
  teamNum,
  timeoutCount,
  timeoutsRemaining,
  reviewsRemaining,
  size,
}: TimeoutsLeftContainerProps) {
  const { data: ruleset } = useSuspenseRuleset(boutUuid);

  const {
    data: latestTimeout,
    isPending,
    isEnabled,
  } = useTimeout(boutUuid, timeoutCount - 1, {
    enabled: timeoutCount > 0,
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
      timeoutsRemaining={timeoutsRemaining}
      reviewsRemaining={reviewsRemaining}
      timeoutIsActive={timeoutIsActive}
      isReview={isReview}
      size={size}
    />
  );
}
