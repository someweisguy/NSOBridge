import { ReactElement } from "react";

export default function NavButton({
  direction,
  onClick
}: {
  direction: "left" | "right";
  onClick?: () => void;
}): ReactElement {
  return (
    <div className="flex-none transition rounded-full shadow-md aspect-square size-8 bg-white text-gray-500 hover:bg-gray-200 opacity-60 hover:opacity-100">
      <button className="size-full" onClick={onClick}>
        {direction == "left" ? <>&#10094;</> : <>&#10095;</>}
      </button>
    </div>
  );
}
