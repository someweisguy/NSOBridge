import { ReactElement } from "react";

export default function TripCard({
  tripIndex,
  points,
  id,
  selected = false,
}: {
  tripIndex: number;
  points?: number;
  id: string;
  selected?: boolean;
}): ReactElement {
  return (
    <div
      aria-selected={selected}
      id={id}
      className="transition duration-200 aria-selected:scale-105 aria-selected:shadow-lg hover:scale-105 hover:shadow-lg aspect-[7/8] flex-none h-full place-content-center rounded-sm bg-gray-200 text-center outline outline-1 outline-gray-300 shadow-md"
    >
      <button className="size-full">
        <p className="text-sm italic font-light text-gray-800">
          Trip {tripIndex + 1}
        </p>
        <p className="text-2xl font-semibold">
          {points != null ? points : <>&nbsp;</>}
        </p>
      </button>
    </div>
  );
}
