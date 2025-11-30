import { RulesetContext } from "@/lib/game/bouts";
import { Team, Timeout } from "@/types/game";
import { twMerge } from "tailwind-merge";

const dotStyle = "bg-black rounded-full aspect-square";

const sizeStyles = {
  small: "w-10",
  medium: "w-16",
  large: "w-20",
};

interface TimeoutBarProps {
  team: Team;
  activeTimeout?: Timeout | null;
  ruleset: RulesetContext;
  size?: keyof typeof sizeStyles;
}

export default function TimeoutBar({
  team,
  activeTimeout,
  ruleset,
  size = "medium",
}: TimeoutBarProps) {
  if (!activeTimeout?.isRunning()) {
    // There is no active Timeout
    activeTimeout = null;
  }

  return (
    <div
      className={twMerge(
        sizeStyles[size],
        "flex flex-col justify-start gap-4 bg-gray-300 p-2 rounded-2xl h-fit",
      )}
    >
      {Array.from({ length: ruleset.numTimeouts }, (_, k) => (
        <div
          key={`t${k}`}
          className={twMerge(
            dotStyle,
            k >= team.timeoutsRemaining && "invisible",
            k == team.timeoutsRemaining - 1 &&
              activeTimeout?.teamId == team.id &&
              !activeTimeout?.isReview &&
              "animate-blink",
          )}
        ></div>
      ))}
      <hr className="mx-1 border-gray-400"></hr>
      {Array.from({ length: ruleset.numReviews }, (_, k) => (
        <div
          key={`r${k}`}
          className={twMerge(
            dotStyle,
            k >= team.reviewsRemaining && "invisible",
            k == team.reviewsRemaining - 1 &&
              activeTimeout?.teamId == team.id &&
              activeTimeout?.isReview &&
              "animate-blink",
          )}
        ></div>
      ))}
    </div>
  );
}
