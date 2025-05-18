import "react";
import { PropsWithChildren } from "react";

interface ButtonProps extends PropsWithChildren {
  onClick?: () => void;
}

export default function Button({ onClick, children }: ButtonProps) {
  return (
    <button onClick={onClick} className="border rounded-sm p-2">
      {children}
    </button>
  );
}
