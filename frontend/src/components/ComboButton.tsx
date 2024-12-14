import { PropsWithChildren, ReactElement } from "react";
import { ButtonContext, ButtonContextType } from "./Button";

export default function ComboButton({
  disabled = false,
  color = "none",
  children,
}: PropsWithChildren<{
  disabled?: boolean;
  color?: "red" | "green" | "blue" | "orange" | "none";
}>): ReactElement {
  const buttonContext: ButtonContextType = {
    isSelected: false,
    isDisabled: disabled,
    color: color,
  };

  return (
    <div className={"flex w-full min-h-fit"}>
      <ButtonContext.Provider value={buttonContext}>
        {children}
      </ButtonContext.Provider>
    </div>
  );
}
