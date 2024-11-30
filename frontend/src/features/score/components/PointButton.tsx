import { PropsWithChildren, ReactElement } from "react";

export default function PointButton({
  onClick = undefined,
  children,
}: PropsWithChildren<{ onClick?: () => void }>): ReactElement {
  return (
    <div className="items-center text-gray-800 bg-white bg-opacity-0 rounded-full size-12 w-fit min-w-12 text-opacity-80 hover:bg-opacity-20 hover:text-opacity-100">
      <button
        onClick={onClick}
        className="p-2 text-2xl font-medium rounded-full size-full"
      >
        {children}
      </button>
    </div>
  );
}
