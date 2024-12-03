import { IntervalType } from "../types/IntervalType";


export default function convertToInterval(duration: number): IntervalType {
  const milliseconds = Math.round((duration % 1000) / 100);
  const seconds = Math.floor((duration / 1000) % 60);
  const minutes = Math.floor((duration / (1000 * 60)) % 60);
  const hours = Math.floor((duration / (1000 * 60 * 60)) % 24);

  return { hours, minutes, seconds, milliseconds };
}