import { localAPI } from "./requests";

export async function undo(): Promise<void> {
  await localAPI.post("undo");
}

export async function redo(): Promise<void> {
  await localAPI.post("redo");
}
