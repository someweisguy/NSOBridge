import { twMerge } from "tailwind-merge";

interface TimeoutBarProps {
  timeoutsRemaining: number;
  reviewsRemaining: number;
  numTimeouts: number;
  numReviews: number;
}

export default function TimeoutBar({
  timeoutsRemaining,
  reviewsRemaining,
  numTimeouts,
  numReviews,
}: TimeoutBarProps) {
  return (
    <div className="place-content-stretch gap-2 grid grid-cols-1 bg-gray-200 p-2 rounded-2xl min-w-fit h-full">
      {Array.from({ length: numTimeouts }, (_, k) => (
        <div
          key={`t${k}`}
          className={twMerge(
            "bg-black p-1 rounded-full aspect-square",
            k >= timeoutsRemaining && "invisible",
          )}
        ></div>
      ))}
      <hr className="border-gray-400 shrink"></hr>
      {Array.from({ length: numReviews }, (_, k) => (
        <div
          key={`r${k}`}
          className={twMerge(
            "bg-black p-1 rounded-full aspect-square",
            k >= reviewsRemaining && "invisible",
          )}
        ></div>
      ))}
    </div>
  );
}
