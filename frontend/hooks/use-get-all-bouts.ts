import queryClient from "@/lib/cache";
import { Bout, getAllBouts } from "@/lib/game/bouts";
import { QueryOptions } from "@/types/query";
import { useQuery } from "@tanstack/react-query";

export const useGetAllBouts = (
  options?: Omit<QueryOptions<Bout[]>, "queryKey" | "queryFn">,
) =>
  useQuery(
    {
      queryKey: Bout.generateKey(),
      queryFn: () =>
        getAllBouts().then((bouts: Bout[]) => {
          for (const bout of bouts) {
            queryClient.setQueryData(Bout.generateKey(bout.uuid), bout);
          }
          return bouts;
        }),
      ...options,
    },
    queryClient,
  );
