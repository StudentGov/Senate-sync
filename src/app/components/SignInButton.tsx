import * as React from "react";
import { cn } from "../lib/utils";

export interface SignInButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
}

const SignInButton = React.forwardRef<HTMLButtonElement, SignInButtonProps>(
  ({ className, asChild = false, children, ...props }, ref) => {
    const Comp = asChild ? "span" : "button";
    
    return (
      <Comp
        className={cn(
          "inline-flex items-center justify-center flex-shrink-0",
          "w-[97px] h-[40px]",
          "px-[21px] py-[8px]",
          "bg-[#FEBD11]",
          "text-black text-center",
          "font-normal text-base leading-normal",
          "border-0",
          "transition-colors",
          "hover:bg-[#FEBD11]/90",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          "disabled:pointer-events-none disabled:opacity-50",
          className
        )}
        ref={ref}
        style={{ fontFamily: "Kanit, -apple-system, Roboto, Helvetica, sans-serif" }}
        {...props}
      >
        {children || "Sign In"}
      </Comp>
    );
  }
);

SignInButton.displayName = "SignInButton";

export { SignInButton };
