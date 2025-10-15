import genericRequest from "./requests";

export async function undo(): Promise<void> {
  await genericRequest("undo", "POST");
}
