import genericRequest from "../request";

export async function getSeries(): Promise<Map<string, string>> {
  const response = await genericRequest<object>("/series", "GET");
  return new Map<string, string>(Object.entries(response.data));
}
