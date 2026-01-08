import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "gap-1 rounded-4xl border border-transparent font-medium transition-all has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&>svg]:pointer-events-none inline-flex items-center justify-center w-fit whitespace-nowrap shrink-0 focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive transition-colors overflow-hidden group/badge",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground [a]:hover:bg-primary/80",
        secondary:
          "bg-secondary text-secondary-foreground [a]:hover:bg-secondary/80",
        destructive:
          "bg-destructive text-destructive-foreground [a]:hover:bg-destructive/80",
        success:
          "bg-green-500 text-white [a]:hover:bg-green-600",
        outline:
          "border-border text-foreground [a]:hover:bg-muted [a]:hover:text-muted-foreground",
        ghost:
          "hover:bg-muted hover:text-muted-foreground dark:hover:bg-muted/50",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-5 px-2 py-0.5 text-xs [&>svg]:size-3!",
        sm: "h-4 px-1.5 py-0 text-[10px] [&>svg]:size-2.5!",
        lg: "h-6 px-3 py-1 text-sm [&>svg]:size-4!",
      },
      appearance: {
        solid: "",
        light: "",
      },
    },
    compoundVariants: [
      {
        variant: "destructive",
        appearance: "light",
        className: "bg-destructive/10 text-destructive [a]:hover:bg-destructive/20 dark:bg-destructive/20",
      },
      {
        variant: "success",
        appearance: "light",
        className: "bg-green-500/10 text-green-600 dark:text-green-400 [a]:hover:bg-green-500/20",
      },
      {
        variant: "secondary",
        appearance: "light",
        className: "bg-secondary/50 text-secondary-foreground [a]:hover:bg-secondary/70",
      },
    ],
    defaultVariants: {
      variant: "default",
      size: "default",
      appearance: "solid",
    },
  }
);

function Badge({
  className,
  variant = "default",
  size = "default",
  appearance = "solid",
  render,
  ...props
}: useRender.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return useRender({
    defaultTagName: "span",
    props: mergeProps<"span">(
      {
        className: cn(badgeVariants({ className, variant, size, appearance })),
      },
      props
    ),
    render,
    state: {
      slot: "badge",
      variant,
    },
  });
}

export { Badge, badgeVariants };
