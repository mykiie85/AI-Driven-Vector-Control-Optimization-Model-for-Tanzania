import * as React from "react"

import { cn } from "@/lib/utils"

function InputOTP({
  className,
  ...props
}: React.ComponentProps<"input">) {
  return (
    <input
      data-slot="input-otp"
      className={cn("disabled:cursor-not-allowed", className)}
      {...props}
    />
  )
}

function InputOTPGroup({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="input-otp-group"
      className={cn("flex items-center", className)}
      {...props}
    />
  )
}

function InputOTPSlot({
  index: _index,
  className,
  ...props
}: React.ComponentProps<"div"> & {
  index: number
}) {
  return (
    <div
      data-slot="input-otp-slot"
      className={cn(
        "border-input relative flex h-9 w-9 items-center justify-center border-y border-r text-sm",
        className
      )}
      {...props}
    />
  )
}

function InputOTPSeparator({ ...props }: React.ComponentProps<"div">) {
  return (
    <div data-slot="input-otp-separator" role="separator" {...props}>
      <span>-</span>
    </div>
  )
}

export { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator }
