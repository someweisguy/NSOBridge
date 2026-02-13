import queryClient from "@/lib/cache";
import { Bout, getAllBouts, getBout } from "@/lib/game/bouts";
import { useQuery, useSuspenseQuery } from "@tanstack/react-query";

export const useSuspenseAllBouts = () =>
  useSuspenseQuery(
    {
      queryKey: Bout.generateKey(),
      queryFn: () =>
        getAllBouts().then((bouts: Bout[]) => {
          for (const bout of bouts) {
            queryClient.setQueryData(Bout.generateKey(bout.uuid), bout);
          }
          return bouts;
        }),
    },
    queryClient,
  );

export const useBout = (uuid: string) =>
  useQuery({
    queryKey: Bout.generateKey(uuid),
    queryFn: () => getBout(uuid),
  });

export const useSuspenseBout = (uuid: string) =>
  useSuspenseQuery({
    queryKey: Bout.generateKey(uuid),
    queryFn: () => getBout(uuid),
  });
