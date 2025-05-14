import { ScrollArea } from "radix-ui";
import { useEffect, useRef, useState } from "react";

export default function TripScroll() {
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
      behavior: "smooth",
    });
  }, [scrollLeft]);

  const TAGS = Array.from({ length: 50 }).map(
    (_, i, a) => `v1.2.0-beta.${a.length - i}`
  );

  return (
    <ScrollArea.Root className="h-[100px] w-[200px] overflow-hidden rounded bg-white shadow-[0_2px_10px] shadow-blackA4">
      <ScrollArea.Viewport ref={viewportRef} className="size-full rounded">
        <div className="flex flex-row px-5 py-[15px]">
          {TAGS.map((tag) => (
            <div
              className="mt-2.5 border-t border-t-mauve6 pt-2.5 text-[13px] leading-[18px] text-mauve12"
              key={tag}
            >
              {tag}
            </div>
          ))}
        </div>
      </ScrollArea.Viewport>
      <ScrollArea.Scrollbar
        className="flex touch-none select-none bg-blue-400 p-0.5 transition-colors duration-[160ms] ease-out hover:bg-black data-[orientation=horizontal]:h-2.5 data-[orientation=vertical]:w-2.5 data-[orientation=horizontal]:flex-col"
        orientation="horizontal"
      >
        <ScrollArea.Thumb className="relative flex-1 rounded-[10px] bg-red-400 before:absolute before:left-1/2 before:top-1/2 before:size-full before:min-h-[44px] before:min-w-[44px] before:-translate-x-1/2 before:-translate-y-1/2" />
      </ScrollArea.Scrollbar>
      <ScrollArea.Corner className="bg-black" />
    </ScrollArea.Root>
  );
}
