import { Card } from "@/components/ui/card";
import {
  Carousel,
  CarouselApi,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { BoutIdContext } from "@/contexts/bout-id";
import { useCallback, useContext, useEffect, useRef, useState } from "react";
import useScore from "@/hooks/use-score";
import { Button } from "@/components/ui/button";
import setTrip from "../../api/setTrip";
import { JamIdContext } from "@/contexts/jam-id";

export default function TripEditor({
  team,
  showInitial = true,
  maxPoints = 4,
}: {
  team: "home" | "away";
  showInitial?: boolean;
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
    if (
      selectedTrip === oldNodeCount.current - 1 &&
      oldNodeCount.current < nodeCount
    ) {
      // Scroll to the latest trip when a new trip is added
      api?.scrollTo(nodeCount);
      setSelectedTrip(nodeCount - 1);
    }
    oldNodeCount.current = nodeCount;
  }, [nodeCount]);

  const setPoints = useCallback(
    (points: number, validPass: boolean = true) =>
      setTrip(boutId, jamId, team, selectedTrip, points, validPass),
    [boutId, jamId, team, jamScore.trips.length, selectedTrip]
  );

  useEffect(() => {
    setSelectedTrip(jamScore.trips.length);
    setNodeCount(jamScore.trips.length + 1);
    api?.scrollTo(jamScore.trips.length + 1, true);
  }, [boutId, jamId, team]);

  return (
    <div className="flex flex-col items-center">
      <div className="flex flex-row gap-3 m-2">
        {selectedTrip == 0 && showInitial ? (
          <>
            <Button variant="secondary" onClick={() => setPoints(0, false)}>
              NP/NP
            </Button>
            <Button variant="default" onClick={() => setPoints(0, true)}>
              Initial
            </Button>
          </>
        ) : (
          Array.from({ length: maxPoints + 1 }, (_, i) => (
            <Button
              variant={i === maxPoints ? "default" : "secondary"}
              onClick={() => setPoints(i, true)}
            >
              {i}
            </Button>
          ))
        )}
      </div>
      <Carousel setApi={setApi} className="mx-16 w-80">
        <Card className="w-full overflow-clip">
          <CarouselContent className="-ml-2">
            {Array.from({ length: jamScore.trips.length + 1 }, (_, i) => (
              <CarouselItem className="pl-2 my-1 basis-1/4 first:ml-1 last:mr-0">
                <Button
                  onClick={() => {
                    setSelectedTrip(i);
                    api?.scrollTo(i);
                  }}
                  variant={i === selectedTrip ? "default" : "secondary"}
                >
                  Trip {i + 1}
                  <br />
                  {i < jamScore.trips.length ? (
                    jamScore.trips[i].points
                  ) : (
                    <>&nbsp;</>
                  )}
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
