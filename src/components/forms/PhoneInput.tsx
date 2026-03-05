import React from "react";
import { Input } from "@/components/ui/input";

interface PhoneInputProps
  extends Omit<
    React.InputHTMLAttributes<HTMLInputElement>,
    "onChange" | "value" | "readOnly"
  > {
  value?: string;
  onChange: (value: string) => void;
  readOnly?: boolean;
}

const normalizeToLocalSaudiNumber = (value: string) => {
  const digits = value.replace(/\D/g, "");

  if (!digits) return "";

  if (digits.startsWith("00966")) {
    return digits.slice(5, 14);
  }

  if (digits.startsWith("966")) {
    return digits.slice(3, 12);
  }

  if (digits.startsWith("05")) {
    return digits.slice(1, 10);
  }

  if (digits.startsWith("5")) {
    return digits.slice(0, 9);
  }

  return digits.slice(0, 9);
};

const PhoneInput = React.forwardRef<HTMLInputElement, PhoneInputProps>(
  (
    {
      value,
      onChange,
      readOnly = false,
      placeholder,
      className,
      ...rest
    },
    ref
  ) => {
    const localValue = normalizeToLocalSaudiNumber(value || "");

    return (
      <div className="relative flex items-center">
        <span className="absolute left-3 text-gray-500 text-sm select-none pointer-events-none">
          +966
        </span>
        <Input
          {...rest}
          ref={ref}
          dir="ltr"
          type="tel"
          className={`${className ? `${className} ` : ""}pl-14`}
          onChange={(e) => {
            const local = normalizeToLocalSaudiNumber(e.target.value);
            onChange(local ? `+966${local}` : "");
          }}
          value={localValue}
          readOnly={readOnly}
          placeholder={placeholder}
          inputMode="numeric"
          pattern="[0-9]*"
          autoComplete="tel-national"
          maxLength={9}
        />
      </div>
    );
  }
);

PhoneInput.displayName = "PhoneInput";

export default PhoneInput;
