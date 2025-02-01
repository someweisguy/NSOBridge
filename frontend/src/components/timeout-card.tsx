import { BoutIdType } from "@/types/bout";
import { Card } from "./ui/card";
import { Separator } from "./ui/separator";
import useBout from "@/hooks/useBout";

function TimeoutDot({ hidden }: { hidden: boolean }) {
  return (
    <div
      aria-hidden={hidden}
      className="min-w-4 rounded-full aspect-square bg-neutral-950 dark:bg-neutral-100 aria-hidden:invisible"
    ></div>
  );
}

export default function TimeoutCard({
  className,
  boutId,
  team,
}: {
  className?: string;
  boutId: BoutIdType;
  team: "home" | "away";
}) {
  const [timeoutNum, officialReviewNum] = useBout<[number, number]>(
    boutId,
    (bout) => [
      bout.timeoutsRemaining[team],
      bout.officialReviewsRemaining[team],
    ]
  );

  return (
    <Card
      className={
        className + "m-2 p-2 w-fit h-fit flex flex-col gap-2 items-center"
      }
    >
      <TimeoutDot hidden={timeoutNum < 1} />
      <TimeoutDot hidden={timeoutNum < 2} />
      <TimeoutDot hidden={timeoutNum < 3} />
      <Separator orientation="horizontal" />
      <TimeoutDot hidden={officialReviewNum < 1} />
    </Card>
  );
}
