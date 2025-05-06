import genericRequest from "../request";

export type Series = Record<
  number,
  {
    uuid: string;
    description: string;
  }
>;

export async function getSeries(): Promise<Series> {
  const response = await genericRequest<Series>("/series", "GET");
  return response.data;
}
