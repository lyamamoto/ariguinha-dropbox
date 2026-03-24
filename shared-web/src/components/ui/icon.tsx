import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "../../lib/utils"
import { assetIcons } from "../../assets/images/icons"

const iconVariants = cva("inline-block shrink-0", {
  variants: {
    size: {
      xs: "h-3 w-3",
      sm: "h-4 w-4",
      md: "h-5 w-5",
      lg: "h-6 w-6",
    },
    spacing: {
      none: "",
      right: "mr-2",
    },
  },
  defaultVariants: {
    size: "sm",
    spacing: "right",
  },
})

export interface IconProps
  extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, "src" | "size">,
    VariantProps<typeof iconVariants> {
  /** Icon key resolved from assets/images/icons/.
   *  e.g. "assets/btc" → looks up "btc" in the icon map */
  icon: string
}

function Icon({ icon, size, spacing, className, alt, ...props }: IconProps) {
  // Extract the last segment as the lookup key: "assets/btc" → "btc"
  const key = icon?.toLowerCase() ?? ""
  const src = assetIcons[key]

  if (!src) return null

  return (
    <img
      src={src}
      alt={alt ?? icon}
      className={cn(iconVariants({ size, spacing }), className)}
      {...props}
    />
  )
}

export { Icon, iconVariants }
