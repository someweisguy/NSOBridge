import { Group, Scroller, ScrollerProps, Text, TextProps } from "@mantine/core";
import { useReducedMotion } from "@mantine/hooks";
import { Children, PropsWithChildren, useEffect, useRef } from "react";

const altTextStyle: TextProps = {
  fz: "xs",
  ta: "center",
  fs: "italic",
  fw: 250,
  c: "dimmed",
};

export interface TripControllerProps
  extends Omit<ScrollerProps, "children">, PropsWithChildren {
  teamIsInThisJam: boolean;
  jammerInitial: boolean;
}

// TODO: docs
export default function TripController({
  teamIsInThisJam,
  jammerInitial,
  children,
  ...props
}: TripControllerProps) {
  const endOfScrollerRef = useRef<HTMLDivElement>(null);
  const numChildren = useRef<number>(0);

  // Scroll to the latest Trip whenever the number of Trips increases
  const reduceMotion = useReducedMotion();
  useEffect(() => {
    // Only scroll-to-end if number of children has increased
    const numChildrenNew = Children.count(children);
    if (numChildrenNew > numChildren.current) {
      endOfScrollerRef?.current?.scrollIntoView({
        behavior: reduceMotion ? "instant" : "smooth",
        inline: "center",
      });
    }
    numChildren.current = numChildrenNew;
  }, [children, reduceMotion]);

  return (
    <Scroller
      ta={!teamIsInThisJam || !jammerInitial ? "center" : "start"}
      {...props}
    >
      {!teamIsInThisJam && (
        <Text {...altTextStyle}>This Team is not in the Jam</Text>
      )}
      {!jammerInitial && teamIsInThisJam && (
        <Text {...altTextStyle}>There are no Trips to display.</Text>
      )}
      {teamIsInThisJam && jammerInitial && (
        <Group justify="start" gap="xs" wrap="nowrap" w="100%">
          {children}
          <div ref={endOfScrollerRef}></div>
        </Group>
      )}
    </Scroller>
  );
}
