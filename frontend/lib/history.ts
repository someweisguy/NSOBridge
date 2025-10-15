import genericRequest from "./requests";

export async function undo(): Promise<void> {
  await genericRequest("undo", "POST");
}

export async function redo(): Promise<void> {
  await genericRequest("redo", "POST");
}
