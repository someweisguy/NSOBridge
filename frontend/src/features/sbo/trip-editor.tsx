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
import { useCallback, useContext, useEffect, useState } from "react";
import { JamIdContext } from "../JamPaginator/components/JamPaginator";
import useScore from "@/hooks/useScore";
import { Button } from "@/components/ui/button";
import setTrip from "../ScoreKeeper/api/setTrip";

export default function TripEditor({ team }: { team: "home" | "away" }) {
  const boutId = useContext(BoutIdContext);
  const jamId = useContext(JamIdContext);
  const jamScore = useScore(boutId, jamId, team);

  const [api, setApi] = useState<CarouselApi>();

  useEffect(() => {
    api?.scrollTo(jamScore.trips.length, true);
  }, [api]);

  const setPoints = useCallback(
    (points: number, validPass: boolean = true) =>
      setTrip(boutId, jamId, team, jamScore.trips.length, points, validPass),
    [boutId, jamId, team, jamScore.trips.length]
  );

  return (
    <div className="flex flex-col items-center">
      <div className="flex flex-row gap-2 m-2">
        {Array.from({ length: 4 + 1 }, (_, i) => (
          <Button
            variant={i === 4 ? "default" : "secondary"}
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
                Trip {i + 1}
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
