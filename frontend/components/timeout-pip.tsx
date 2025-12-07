import { twMerge } from "tailwind-merge";

interface TimeoutPipProps {
  size: number;
  invisible?: boolean;
  active?: boolean;
}

export default function TimeoutPip({
  size,
  invisible = false,
  active = false,
}: TimeoutPipProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      className={twMerge(
        "icon icon-tabler icons-tabler-filled icon-tabler-circle",
        invisible && "invisible",
        active && !invisible && "animate-blink",
      )}
    >
      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
      <path d="M7 3.34a10 10 0 1 1 -4.995 8.984l-.005 -.324l.005 -.324a10 10 0 0 1 4.995 -8.336z" />
    </svg>
  );
}
