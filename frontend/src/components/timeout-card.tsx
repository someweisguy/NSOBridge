import { BoutIdType } from "@/types/bout";
import { Card, CardContent } from "./ui/card";
import { Separator } from "./ui/separator";
import useBout from "@/hooks/useBout";

function TimeoutDot({ hidden }: { hidden: boolean }) {
  return (
    <div
      aria-hidden={hidden}
      className="object-contain rounded-full aspect-square bg-neutral-950 dark:bg-neutral-100 aria-hidden:invisible"
    />
  );
}

export default function TimeoutCard({
  boutId,
  team,
}: {
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
    <Card>
      <CardContent className="p-6">
        <div className="grid grid-flow-row gap-3">
          <TimeoutDot hidden={timeoutNum < 1} />
          <TimeoutDot hidden={timeoutNum < 2} />
          <TimeoutDot hidden={timeoutNum < 3} />
          <Separator />
          <TimeoutDot hidden={officialReviewNum < 1} />
        </div>
      </CardContent>
    </Card>
  );
}
