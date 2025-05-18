import { PropsWithChildren } from "react";
import { Checkbox } from "radix-ui";
import { CheckIcon, DividerHorizontalIcon } from "@radix-ui/react-icons";

interface CheckboxButtonProps extends PropsWithChildren {
  checked: boolean | "indeterminate";
  onClick?: () => void;
}

export default function CheckboxButton({
  checked,
  onClick,
  children,
}: CheckboxButtonProps) {
  return (
    <div className="flex items-center border rounded-md justify-center p-2">
      <Checkbox.Root
        className="flex size-5 border appearance-none items-center justify-center rounded outline-none"
        onClick={onClick}
        checked={checked}
        id="c1"
      >
        <Checkbox.Indicator className="">
          {checked === "indeterminate" && <DividerHorizontalIcon />}
          {checked && <CheckIcon />}
        </Checkbox.Indicator>
      </Checkbox.Root>
      <label className="pl-3 leading-none" htmlFor="c1">
        {children}
      </label>
    </div>
  );
}
