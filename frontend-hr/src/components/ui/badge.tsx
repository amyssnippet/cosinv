import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "bg-blue-100 text-blue-700 border border-blue-200",
        secondary: "bg-slate-100 text-slate-700",
        destructive: "bg-red-100 text-red-700 border border-red-200",
        success: "bg-green-100 text-green-700 border border-green-200",
        warning: "bg-yellow-100 text-yellow-700 border border-yellow-200",
        outline: "border border-slate-300 text-slate-700",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />
}

// eslint-disable-next-line react-refresh/only-export-components
export { Badge, badgeVariants }
