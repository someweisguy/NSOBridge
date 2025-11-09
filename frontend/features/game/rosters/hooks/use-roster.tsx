import { getRosters, Roster } from "@/features/game/rosters/types";
import { useSuspenseQuery } from "@tanstack/react-query";

export default function useRoster(rosterId: number): Roster {
  const { data } = useSuspenseQuery<Roster[], unknown, Roster>({
    queryKey: Roster.generateKey(rosterId),
    queryFn: () => getRosters([rosterId]),
    select: (rosters: Roster[]) => {
      // Only cache one item despite getRosters() returning multiple results
      return rosters[0];
    },
  });

  return data;
}
