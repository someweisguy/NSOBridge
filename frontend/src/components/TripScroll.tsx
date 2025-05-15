import { ScrollArea } from "radix-ui";
import { useEffect, useRef, useState } from "react";
import TripCard from "./TripCard";
import { Trip } from "@/lib/client/api/jam";

interface TripScrollProps {
  trips: Trip[];
}

export default function TripScroll({ trips }: TripScrollProps) {
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

  return (
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
            />
          ))}
          <TripCard tripNum={trips.length} points={null} />
        </div>
      </ScrollArea.Viewport>
      <ScrollArea.Scrollbar
        className="flex touch-none select-none bg-slate-200 p-0.5 transition-colors duration-[160ms] ease-out hover:bg-slate-700 h-2.5 flex-col"
        orientation="horizontal"
      >
        <ScrollArea.Thumb className="flex-1 rounded-full bg-slate-400 " />
      </ScrollArea.Scrollbar>
    </ScrollArea.Root>
  );
}
