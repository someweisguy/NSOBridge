import {
  createContext,
  PropsWithChildren,
  ReactElement,
  useContext,
} from "react";

export type ButtonContextType = {
  color: "red" | "blue" | "orange" | "green" | "none";
  isDisabled: boolean;
  isSelected: boolean;
  // shape: "sm" | "md" | "lg";  // TODO
};

export const ButtonContext = createContext<ButtonContextType | null>(null);

const shape = "relative px-2 py-1 m-2 rounded-lg min-size-fit border";
const comboShape =
  "relative flex-1 px-2 py-1 my-2 min-size-fit first:ml-2 border-y first:border-l first:rounded-l-full last:mr-2 last:border-r last:rounded-r-full";

const colors = {
  red: "bg-red-200 border-red-500 text-red-950 hover:bg-red-300 aria-selected:bg-red-400 aria-selected:text-red-50 disabled:bg-red-200 disabled:text-red-400",
  blue: "bg-blue-200 border-blue-500 text-blue-950 hover:bg-blue-300 aria-selected:bg-blue-400 aria-selected:text-blue-50 disabled:bg-blue-200 disabled:text-blue-400",
  orange:
    "bg-orange-300 border-orange-600 text-orange-950 hover:bg-orange-400 aria-selected:bg-orange-500 aria-selected:text-orange-50 disabled:bg-orange-100 disabled:text-orange-400",
  green:
    "bg-green-300 border-green-600 text-green-950 hover:bg-green-400 aria-selected:bg-green-500 aria-selected:text-green-50 disabled:bg-green-100 disabled:text-green-400",
  none: "bg-raisin-50 border-raisin-500 text-raisin-950 hover:bg-raisin-200 aria-selected:bg-raisin-300 aria-selected:text-raisin-50 disabled:border-raisin-300 disabled:text-raisin-300 disabled:hover:bg-raisin-100",
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
  color?: "red" | "green" | "blue" | "orange" | "none";
}>): ReactElement {
  const context: ButtonContextType | null = useContext(ButtonContext);
  const colorKey = context == null ? color : context.color;

  return (
    <button
      aria-selected={
        context == null ? isSelected : isSelected || context.isSelected
      }
      disabled={disabled || context?.isDisabled}
      onClick={onClick}
      className={`${context == null ? shape : comboShape} ${colors[colorKey]}`}
    >
      {children}
    </button>
  );
}
