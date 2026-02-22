"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

function Calendar({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="calendar"
      className={cn("bg-background p-3", className)}
      {...props}
    />
  )
}

function CalendarDayButton({
  className,
  ...props
}: React.ComponentProps<"button">) {
  return (
    <button
      className={cn("flex aspect-square size-auto w-full min-w-8 items-center justify-center rounded-md", className)}
      {...props}
    />
  )
}

export { Calendar, CalendarDayButton }
