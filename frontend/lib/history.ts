import { localAPI } from "./requests";

/**
 * Call the Undo API. Undo and redo histories are based off a user UUID cookie.
 * Histories are volatile and are erased when restarting the server.
 */
export async function undo(): Promise<void> {
  await localAPI.post("undo");
}

/**
 * Call the Redo API. Undo and redo histories are based off a user UUID cookie.
 * Histories are volatile and are erased when restarting the server.
 */
export async function redo(): Promise<void> {
  await localAPI.post("redo");
}
