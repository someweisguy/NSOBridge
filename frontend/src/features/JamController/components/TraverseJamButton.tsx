import { PropsWithChildren } from "react";

export default function TraverseJamButton({
  disabled = false,
  onClick,
  children,
}: PropsWithChildren<{ disabled: boolean, onClick: () => void }>) {
  return (
    <button
      disabled={disabled}
      onClick={onClick}
      className="px-3 py-1 m-1 text-sm bg-yellow-400 rounded-full min-w-fit ring-1 ring-yellow-500"
    >
      {children}
    </button>
  );
}
