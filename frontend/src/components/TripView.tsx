import { TeamString, Trip } from "@/lib/client/api/jam";
import { ScrollArea } from "radix-ui";
import { useEffect, useRef, useState } from "react";
import PointButtons from "./PointButtons";
import useJam from "@/hooks/use-jam";

interface TripScrollProps {
  boutId: string;
  periodNum: number;
  jamNum: number;
  team: TeamString;
}

interface TripCardProps {
  key?: number;
  tripNum: number;
  points: number | null;
  onClick: () => void;
}

export default function TripView({
  boutId,
  periodNum,
  jamNum,
  team,
}: TripScrollProps) {
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const [scrollLeft, setScrollLeft] = useState(0);

  useEffect(() => {
    const container = viewportRef.current!;
    const maxWidth = container.scrollWidth - container.offsetWidth;

    setTimeout(() => setScrollLeft(maxWidth), 100);

    const handleWheel = (ev: WheelEvent) => {
      ev.preventDefault();
      ev.stopPropagation();
      setScrollLeft((scrollLeft) => {
        const newScrollLeft = scrollLeft + ev.deltaY * 0.75;
        return Math.max(Math.min(newScrollLeft, maxWidth), 0);
      });
    };

    container.addEventListener("wheel", handleWheel as EventListener);
    return () => container.removeEventListener("wheel", handleWheel);
  }, []);

  useEffect(() => {
    viewportRef.current?.scrollTo({
      left: scrollLeft,
      behavior: "auto",
    });
  }, [scrollLeft]);

  const trips: Trip[] = useJam(boutId, periodNum, jamNum)[team].score.trips;
  const [tripNum, setTripNum] = useState(trips.length);

  return (
    <div>
      <PointButtons
        boutId={boutId}
        periodNum={periodNum}
        jamNum={jamNum}
        team={team}
        tripNum={tripNum}
      />
      <ScrollArea.Root className="border w-[300px] overflow-hidden rounded">
        <ScrollArea.Viewport
          ref={viewportRef}
          className="h-full size-full rounded"
        >
          <div className="grid grid-flow-col size-full content-center px-3 py-2">
            {trips.map((t, i) => (
              <TripCard
                key={t.timestamp.getTime()}
                tripNum={i}
                points={t.points}
                onClick={() => setTripNum(i)}
              />
            ))}
            <TripCard
              tripNum={trips.length}
              points={null}
              onClick={() => setTripNum(trips.length + 1)}
            />
          </div>
        </ScrollArea.Viewport>
        <ScrollArea.Scrollbar
          className="flex touch-none select-none bg-slate-200 p-0.5 transition-colors duration-[160ms] ease-out hover:bg-slate-700 h-2.5 flex-col"
          orientation="horizontal"
        >
          <ScrollArea.Thumb className="flex-1 rounded-full bg-slate-400 " />
        </ScrollArea.Scrollbar>
      </ScrollArea.Root>
    </div>
  );
}

function TripCard({ tripNum, points }: TripCardProps) {
  return (
    <button
      className="h-16 w-14 flex flex-col overflow-hidden border border-slate rounded-md mx-1 my-1 text-center"
      onClick={() => console.log("click")}
    >
      <div className="bg-slate-100 w-full h-1/3 text-center border-b text-xs italic">
        Trip {tripNum + 1}
      </div>
      <div className="h-full content-center text-lg font-semibold">
        {points ?? ""}
      </div>
    </button>
  );
}
