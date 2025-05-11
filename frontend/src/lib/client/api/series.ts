import genericRequest from "../request";

export type Series = Record<
  number,
  {
    id: string;
    description: string;
  }
>;

export async function getSeries(): Promise<Series> {
  return await genericRequest<Series>("/api/series", "GET");
}
