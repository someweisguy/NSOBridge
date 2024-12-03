import { DurationType } from "../types/DurationType";


export default function toDuration(duration: number): DurationType {
  const isNegative = duration < 0;
  if (isNegative) {
    duration = -duration;
  }

  const milliseconds = Math.round(duration % 1000);
  const seconds = Math.floor((duration / 1000) % 60);
  const minutes = Math.floor((duration / (1000 * 60)) % 60);
  const hours = Math.floor((duration / (1000 * 60 * 60)) % 24);

  return { isNegative, hours, minutes, seconds, milliseconds };
}