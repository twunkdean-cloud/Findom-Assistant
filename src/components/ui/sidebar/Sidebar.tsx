import * as React from "react"
import { cn } from "@/lib/utils"
import { useSidebar } from "./SidebarProvider"

const Sidebar = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div">
>(({ className, ...props }, ref) => {
  const { state } = useSidebar();

  return (
    <div
      ref={ref}
      className={cn(
        "relative hidden h-full flex-col bg-background transition-all duration-300 ease-in-out",
        state === "collapsed" && "md:w-16",
        state === "expanded" && "md:w-64",
        className
      )}
      {...props}
    >
      {/* Sidebar content */}
    </div>
  )
})
Sidebar.displayName = "Sidebar"

export { Sidebar }