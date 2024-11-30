import { PropsWithChildren, ReactElement } from "react";

export default function CheckboxButton({
  selected,
  disabled = false,
  onClick,
  children,
}: PropsWithChildren<{
  selected: boolean;
  disabled?: boolean;
  onClick: () => void;
}>): ReactElement {
  return (
    <button
      disabled={disabled}
      onClick={onClick}
      className="flex items-center w-full p-2 m-1 rounded-md outline outline-1 outline-gray-300 h-fit max-w-32"
    >
      <span className="flex-1 text-start size-fit">{children}</span>
      {selected ? <>&#9745;</> : <>&#9744;</>}
    </button>
  );
}
