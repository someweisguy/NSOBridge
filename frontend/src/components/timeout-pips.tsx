import { Card } from "./ui/card";
import { Separator } from "./ui/separator";

function Pip({ hidden, active }: { hidden: boolean; active: boolean }) {
  return (
    <div
      aria-hidden={hidden}
      data-active={active}
      className="min-w-4 rounded-full aspect-square bg-neutral-950 dark:bg-neutral-100 aria-hidden:invisible data-[active='true']:animate-pulse"
    ></div>
  );
}

export default function TimeoutPips({
  className,
  activeTimeout,
  maxTimeouts = 3,
  maxOfficialReviews = 1,
  timeoutsRemaining,
  officialReviewsRemaining,
}: {
  className?: string;
  activeTimeout: "timeout" | "officialReview" | "none";
  maxTimeouts?: number;
  maxOfficialReviews?: number;
  timeoutsRemaining: number;
  officialReviewsRemaining: number;
}) {
  return (
    <Card
      className={
        className + "m-2 p-2 w-fit h-fit flex flex-col gap-2 items-center"
      }
    >
      {Array.from({ length: maxTimeouts }, (_, i) => (
        <Pip
          key={i}
          hidden={i >= timeoutsRemaining}
          active={activeTimeout == "timeout" && i == timeoutsRemaining - 1}
        />
      ))}

      <Separator orientation="horizontal" />

      {Array.from({ length: maxOfficialReviews }, (_, i) => (
        <Pip
          key={i}
          hidden={i >= officialReviewsRemaining}
          active={
            activeTimeout == "officialReview" &&
            i == officialReviewsRemaining - 1
          }
        />
      ))}
    </Card>
  );
}
