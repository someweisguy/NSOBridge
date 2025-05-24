import { BoutIdContext } from "@/app/provider";
import useJam from "@/hooks/use-jam";
import { TeamString, Trip } from "@/lib/client/api/jam";
import { ScrollArea } from "radix-ui";
import { useContext, useEffect, useRef, useState } from "react";
import JammerState from "./jammer-state";
import PointButtons from "./point-buttons";
import TripCard from "./trip-card";

interface TripScrollProps {
  boutId?: string;
  periodNum: number;
  jamNum: number;
  team: TeamString;
}

export default function TripView({
  boutId,
  periodNum,
  jamNum,
  team,
}: TripScrollProps) {
  const [boutIdContext] = useContext(BoutIdContext);
  boutId ??= boutIdContext;

  const viewportRef = useRef<HTMLDivElement | null>(null);
  const [scrollLeft, setScrollLeft] = useState(0);

  useEffect(() => {
    viewportRef.current?.scrollTo({
      left: scrollLeft,
      behavior: "auto",
    });
  }, [scrollLeft]);

  const trips: Trip[] = useJam(boutId, periodNum, jamNum)[team].score.trips;
  const [tripNum, setTripNum] = useState(trips.length);
  const lastTripRef = useRef({
    boutId,
    periodNum,
    jamNum,
    team,
    tripNum,
  });

  useEffect(() => {
    // Scroll to the end of the Trip viewport on hydration
    const container = viewportRef.current!;
    const maxWidth = container.scrollWidth - container.offsetWidth;
    setScrollLeft(maxWidth);
  }, []);

  useEffect(() => {
    const container = viewportRef.current!;
    const maxWidth = container.scrollWidth - container.offsetWidth;
    if (trips.length == lastTripRef.current.tripNum + 1) {
      // Update the selected Trip number to the latest
      setTripNum(trips.length);
      setScrollLeft(maxWidth);
    }

    // Convert up/down scroll-wheel into left/right
    const handleWheel = (ev: WheelEvent) => {
      ev.preventDefault();
      ev.stopPropagation();
      setScrollLeft((scrollLeft) => {
        const newScrollLeft = scrollLeft + ev.deltaY * 0.75;
        return Math.max(Math.min(newScrollLeft, maxWidth), 0);
      });
    };
    container.addEventListener("wheel", handleWheel);
    return () => container.removeEventListener("wheel", handleWheel);
  }, [trips.length]);

  useEffect(() => {
    const lastTrip = lastTripRef.current;
    if (
      lastTrip.boutId !== boutId ||
      lastTrip.periodNum !== periodNum ||
      lastTrip.jamNum !== jamNum ||
      lastTrip.team !== team
    ) {
      // Reset the current trip to the latest trip when the Jam changes
      setTripNum(trips.length);
      lastTripRef.current = { boutId, periodNum, jamNum, team, tripNum };
    } else if (lastTrip.tripNum != tripNum) {
      // Update just the last Trip number reference
      lastTrip.tripNum = tripNum;
    }
  }, [boutId, periodNum, jamNum, team, tripNum, trips]);

  return (
    <div>
      <PointButtons
        boutId={boutId}
        periodNum={periodNum}
        jamNum={jamNum}
        team={team}
        tripNum={tripNum}
        showInitial={trips.length === 0}
      />
      <ScrollArea.Root className="border rounded w-[300px] overflow-hidden">
        <ScrollArea.Viewport
          ref={viewportRef}
          className="rounded h-full size-full"
        >
          <div className="justify-start grid grid-flow-col px-3 py-2 size-full">
            {trips.map((t, i) => (
              <TripCard
                key={t.timestamp.getTime()}
                tripNum={i}
                points={t.points}
                selected={i === tripNum}
                onClick={() => setTripNum(i)}
              />
            ))}
            <TripCard
              tripNum={trips.length}
              points={null}
              selected={trips.length === tripNum}
              onClick={() => setTripNum(trips.length)}
            />
          </div>
        </ScrollArea.Viewport>
        <ScrollArea.Scrollbar
          className="flex flex-col bg-slate-200 hover:bg-slate-700 p-0.5 h-2.5 transition-colors duration-[160ms] ease-out touch-none select-none"
          orientation="horizontal"
        >
          <ScrollArea.Thumb className="flex-1 bg-slate-400 rounded-full" />
        </ScrollArea.Scrollbar>
      </ScrollArea.Root>
      <JammerState
        periodNum={periodNum}
        jamNum={jamNum}
        team={team}
        tripNum={tripNum}
      />
    </div>
  );
}
