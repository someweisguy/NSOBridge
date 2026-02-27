import TimeoutsLeft from "@/features/timeouts/components/timeouts-left";
import { useSuspenseRuleset } from "@/hooks/use-suspense-ruleset";
import { useTimeout } from "@/hooks/use-timeout";
import { Bout } from "@/lib/game/bouts";

interface TimeoutsLeftContainerProps {
  bout: Bout; // TODO: remove this from props
  num: number;
  timeoutsRemaining: number;
  reviewsRemaining: number;
  size: number;
}

export default function TimeoutsLeftContainer({
  bout,
  num,
  timeoutsRemaining,
  reviewsRemaining,
  size,
}: TimeoutsLeftContainerProps) {
  const { data: ruleset } = useSuspenseRuleset(bout.uuid);

  const {
    data: latestTimeout,
    isPending,
    isEnabled,
  } = useTimeout(bout.uuid, bout.timeoutCount - 1, {
    enabled: bout.timeoutCount > 0,
  });

  const timeoutIsActive =
    !isPending &&
    isEnabled &&
    latestTimeout?.teamNum == num &&
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
