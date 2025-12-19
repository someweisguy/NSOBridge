import { Roster } from "@/types/people";
import { useSuspenseQuery } from "@tanstack/react-query";
import getRoster from "../lib/game/rosters";

export default function useRoster(rosterId: number): Roster {
  const { data } = useSuspenseQuery<Roster, unknown, Roster>({
    queryKey: Roster.generateKey(rosterId),
    queryFn: () => getRoster(rosterId),
  });

  return data;
}
