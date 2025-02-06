import { Card } from "@/components/ui/card";
import {
  Carousel,
  CarouselApi,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { BoutIdContext } from "@/contexts/BoutIdContext";
import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { JamIdContext } from "../JamPaginator/components/JamPaginator";
import useScore from "@/hooks/useScore";
import { Button } from "@/components/ui/button";
import setTrip from "../ScoreKeeper/api/setTrip";

export default function TripEditor({
  team,
  maxPoints = 4,
}: {
  team: "home" | "away";
  maxPoints?: number;
}) {
  const boutId = useContext(BoutIdContext);
  const jamId = useContext(JamIdContext);
  const jamScore = useScore(boutId, jamId, team);

  const [selectedTrip, setSelectedTrip] = useState<number>(
    jamScore.trips.length
  );

  const [api, setApi] = useState<CarouselApi>();
  const [nodeCount, setNodeCount] = useState<number>(jamScore.trips.length + 1);
  const oldNodeCount = useRef<number>(jamScore.trips.length);

  useEffect(() => {
    api?.scrollTo(jamScore.trips.length, true);
    api?.on("slidesChanged", () => {
      // Adapt the carousel API to a React hook
      setNodeCount(api.slideNodes().length);
    });
  }, [api]);

  useEffect(() => {
    if (selectedTrip === oldNodeCount.current - 1 &&
        oldNodeCount.current < nodeCount) {
      // Scroll to the latest trip when a new trip is added
      api?.scrollTo(nodeCount);
      setSelectedTrip(nodeCount - 1);
    }
    oldNodeCount.current = nodeCount;
  }, [nodeCount]);

  const setPoints = useCallback(
    (points: number, validPass: boolean = true) =>
      setTrip(boutId, jamId, team, jamScore.trips.length, points, validPass),
    [boutId, jamId, team, jamScore.trips.length]
  );

  return (
    <div className="flex flex-col items-center">
      <div className="flex flex-row gap-2 m-2">
        {/* TODO: add initial Trip buttons */}
        {Array.from({ length: maxPoints + 1 }, (_, i) => (
          <Button
            variant={i === maxPoints ? "default" : "secondary"}
            onClick={() => setPoints(i, true)}
          >
            {i}
          </Button>
        ))}
      </div>
      <Carousel setApi={setApi}>
        <Card>
          <CarouselContent className="-ml-4">
            {Array.from({ length: jamScore.trips.length + 1 }, (_, i) => (
              <CarouselItem className="pl-4 basis-1/5">
                <Button
                  onClick={() => setSelectedTrip(i)}
                  variant={i === selectedTrip ? "default" : "secondary"}
                >
                  Trip {i + 1}
                </Button>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Card>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
    </div>
  );
}
