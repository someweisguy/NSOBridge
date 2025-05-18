import { CheckIcon, DividerHorizontalIcon } from "@radix-ui/react-icons";
import { Checkbox } from "radix-ui";
import { PropsWithChildren } from "react";

interface CheckboxButtonProps extends PropsWithChildren {
  key: string;
  checked: boolean | "indeterminate";
  disabled?: boolean;
  onClick?: () => void;
}

export default function CheckboxButton({
  key,
  onClick,
  checked,
  disabled = false,
  children,
}: CheckboxButtonProps) {
  return (
    <div className="flex items-center border rounded-md justify-center p-2">
      <Checkbox.Root
        id={key}
        className="flex size-5 border appearance-none items-center justify-center rounded outline-none"
        onCheckedChange={onClick}
        checked={checked}
        disabled={disabled}
      >
        <Checkbox.Indicator className="">
          {checked === "indeterminate" && <DividerHorizontalIcon />}
          {checked && <CheckIcon />}
        </Checkbox.Indicator>
      </Checkbox.Root>
      <label className="pl-3 leading-none" htmlFor={key}>
        {children}
      </label>
    </div>
  );
}
