import { twMerge } from "tailwind-merge";

interface TimeoutBarProps {
  timeoutsRemaining: number;
  reviewsRemaining: number;
  numTimeouts: number;
  numReviews: number;
}

const dotStyle = "bg-black rounded-full aspect-square";

export default function TimeoutBar({
  timeoutsRemaining,
  reviewsRemaining,
  numTimeouts,
  numReviews,
}: TimeoutBarProps) {
  return (
    <div className="flex flex-col justify-start place-items-stretch gap-2 bg-gray-200 p-4 rounded-2xl w-full h-fit min-h-fit align-middle">
      {Array.from({ length: numTimeouts }, (_, k) => (
        <div
          key={`t${k}`}
          className={twMerge(dotStyle, k >= timeoutsRemaining && "invisible")}
        ></div>
      ))}
      <hr className="border-gray-400"></hr>
      {Array.from({ length: numReviews }, (_, k) => (
        <div
          key={`r${k}`}
          className={twMerge(dotStyle, k >= reviewsRemaining && "invisible")}
        ></div>
      ))}
    </div>
  );
}
