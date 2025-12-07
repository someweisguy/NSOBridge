import { RulesetContext } from "@/lib/game/bouts";
import { Team, Timeout } from "@/types/game";
import { Card, Center, Divider } from "@mantine/core";

interface TimeoutBarProps {
  team: Team;
  activeTimeout?: Timeout | null;
  ruleset: RulesetContext;
  size: number;
}

interface TimeoutPipProps {
  size: number;
}

function TimeoutPip({ size }: TimeoutPipProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      className="icon icon-tabler icons-tabler-filled icon-tabler-circle"
    >
      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
      <path d="M7 3.34a10 10 0 1 1 -4.995 8.984l-.005 -.324l.005 -.324a10 10 0 0 1 4.995 -8.336z" />
    </svg>
  );
}

export default function TimeoutBar({
  // team,
  activeTimeout,
  ruleset,
  size = 30,
}: TimeoutBarProps) {
  if (!activeTimeout?.isRunning()) {
    // There is no active Timeout
    activeTimeout = null;
  }

  return (
    <Card withBorder w={size} radius="md">
      {Array.from({ length: ruleset.numTimeouts }, (_, i) => (
        <Card.Section key={i}>
          <Center>
            <TimeoutPip size={size} />
          </Center>
        </Card.Section>
      ))}
      <Card.Section>
        <Divider mx={4} my={2} />
      </Card.Section>
      {Array.from({ length: ruleset.numReviews }, (_, i) => (
        <Card.Section key={i}>
          <Center>
            <TimeoutPip size={size} />
          </Center>
        </Card.Section>
      ))}
    </Card>
  );

  // TODO: remove these comments
  // return (
  //   <div
  //     className={twMerge(
  //       sizeStyles[size],
  //       "flex flex-col justify-start gap-4 bg-gray-300 p-2 rounded-2xl h-fit"
  //     )}
  //   >
  //     {Array.from({ length: ruleset.numTimeouts }, (_, k) => (
  //       <div
  //         key={`t${k}`}
  //         className={twMerge(
  //           dotStyle,
  //           k >= team.timeoutsRemaining && "invisible",
  //           k == team.timeoutsRemaining - 1 &&
  //             activeTimeout?.teamId == team.id &&
  //             !activeTimeout?.isReview &&
  //             "animate-blink"
  //         )}
  //       ></div>
  //     ))}
  //     <hr className="mx-1 border-gray-400"></hr>
  //     {Array.from({ length: ruleset.numReviews }, (_, k) => (
  //       <div
  //         key={`r${k}`}
  //         className={twMerge(
  //           dotStyle,
  //           k >= team.reviewsRemaining && "invisible",
  //           k == team.reviewsRemaining - 1 &&
  //             activeTimeout?.teamId == team.id &&
  //             activeTimeout?.isReview &&
  //             "animate-blink"
  //         )}
  //       ></div>
  //     ))}
  //   </div>
  // );
}
