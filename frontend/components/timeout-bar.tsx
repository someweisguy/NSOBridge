import { twMerge } from "tailwind-merge";

const dotStyle = "bg-black rounded-full aspect-square";

const sizeStyles = {
  small: "w-10",
  medium: "w-16",
  large: "w-20",
};

interface TimeoutBarProps {
  timeoutsRemaining: number;
  reviewsRemaining: number;
  numTimeouts: number;
  numReviews: number;
  activeTimeout: "timeout" | "review" | null;
  size?: keyof typeof sizeStyles;
}

export default function TimeoutBar({
  timeoutsRemaining,
  reviewsRemaining,
  numTimeouts,
  numReviews,
  activeTimeout,
  size = "medium",
}: TimeoutBarProps) {
  return (
    <div
      className={twMerge(
        sizeStyles[size],
        "flex flex-col justify-start gap-4 bg-gray-300 p-2 rounded-2xl h-fit",
      )}
    >
      {Array.from({ length: numTimeouts }, (_, k) => (
        <div
          key={`t${k}`}
          className={twMerge(
            dotStyle,
            k >= timeoutsRemaining && "invisible",
            k == timeoutsRemaining - 1 &&
              activeTimeout == "timeout" &&
              "animate-ping", // TODO: make a custom Tailwind animation for timeouts
          )}
        ></div>
      ))}
      <hr className="mx-1 border-gray-400"></hr>
      {Array.from({ length: numReviews }, (_, k) => (
        <div
          key={`r${k}`}
          className={twMerge(
            dotStyle,
            k >= reviewsRemaining && "invisible",
            k == reviewsRemaining - 1 &&
              activeTimeout == "review" &&
              "animate-ping", // TODO: make a custom Tailwind animation for timeouts
          )}
        ></div>
      ))}
    </div>
  );
}
