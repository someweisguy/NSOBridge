import {
  createContext,
  PropsWithChildren,
  ReactElement,
  useContext,
} from "react";

export const ButtonDisabledContext = createContext(false);

const shape = "relative px-2 py-1 m-2 rounded-lg min-size-fit border";

const colors = {
  red: "bg-red-200 border-red-500 text-red-950 hover:bg-red-300 aria-selected:bg-red-400 aria-selected:text-red-50 disabled:bg-red-200 disabled:text-red-400",
  blue: "bg-blue-200 border-blue-500 text-blue-950 hover:bg-blue-300 aria-selected:bg-blue-400 aria-selected:text-blue-50 disabled:bg-blue-200 disabled:text-blue-400",
  orange:
    "bg-orange-300 border-orange-600 text-orange-950 hover:bg-orange-400 aria-selected:bg-orange-500 aria-selected:text-orange-50 disabled:bg-orange-100 disabled:text-orange-400",
  green:
    "bg-green-300 border-green-600 text-green-950 hover:bg-green-400 aria-selected:bg-green-500 aria-selected:text-green-50 disabled:bg-green-100 disabled:text-green-400",
  none: "bg-raisin-100 border-raisin-200 text-raisin-950 hover:bg-raisin-200 aria-selected:bg-raisin-300 aria-selected:text-raisin-50 disabled:border-raisin-300 disabled:text-raisin-300 disabled:hover:bg-raisin-100",
};

export default function Button({
  color = "none",
  onClick,
  isSelected = false,
  disabled,
  children,
}: PropsWithChildren<{
  onClick?: () => void;
  isSelected?: boolean;
  disabled?: boolean;
  color?: "red" | "blue" | "orange" | "green" | "none";
}>): ReactElement {
  const disabledContext: boolean = useContext(ButtonDisabledContext);

  return (
    <button
      aria-selected={isSelected}
      disabled={disabled || disabledContext}
      onClick={onClick}
      className={`${shape} ${colors[color]}`}
    >
      {children}
    </button>
  );
}
