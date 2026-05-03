import { Bout } from "@/types/bout";

/**
 * Check if the Bout is in overtime.
 *
 * @param bout The Bout to check.
 * @returns True if the Bout is in overtime.
 */
export const isOvertime = (bout: Bout): boolean => bout.jamCounts[2] > 0;
