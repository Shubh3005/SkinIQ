
import * as React from "react"
import { Input } from "./input"
import { cn } from "@/lib/utils"

export interface TimePickerProps extends React.InputHTMLAttributes<HTMLInputElement> {
  onChange?: (time: string) => void
}

export const TimePicker = React.forwardRef<HTMLInputElement, TimePickerProps>(
  ({ className, onChange, ...props }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (onChange) {
        onChange(e.target.value);
      }
    };

    return (
      <Input
        type="time"
        className={cn("w-full", className)}
        onChange={handleChange}
        ref={ref}
        {...props}
      />
    )
  }
)
TimePicker.displayName = "TimePicker"
