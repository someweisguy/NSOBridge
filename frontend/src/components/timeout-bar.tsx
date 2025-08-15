import { twMerge } from "tailwind-merge";

interface TimeoutBarProps {
  timeoutsRemaining: number;
  reviewsRemaining: number;
}

export default function TimeoutBar({
  timeoutsRemaining,
  reviewsRemaining,
}: TimeoutBarProps) {
  return (
    <div className="gap-2 grid grid-flow-row bg-slate-200 m-2 p-2 rounded-lg w-fit h-fit">
      {Array.from({ length: 3 }, (_, k) => (
        // FIXME: add maxTimeouts
        <div
          key={`t${k}`}
          className={twMerge(
            "bg-black rounded-full size-4",
            k < timeoutsRemaining ? "visible" : "invisible"
          )}
        ></div>
      ))}
      <hr className="border-gray-400"></hr>
      {Array.from({ length: 1 }, (_, k) => (
        // FIXME: add maxReviews
        <div
          key={`r${k}`}
          className={twMerge(
            "bg-black rounded-full size-4",
            k < reviewsRemaining ? "visible" : "invisible"
          )}
        ></div>
      ))}
    </div>
  );
}
