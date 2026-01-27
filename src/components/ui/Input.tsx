import { forwardRef } from 'react';
import { cn } from "../../lib/utils";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(({ className, error, ...props }, ref) => {
  return (
    <input
      ref={ref}
      className={cn(
        "w-full px-4 py-3 rounded-xl",
        "bg-white border-none shadow-sm ring-1 ring-slate-200",
        "text-slate-900 placeholder:text-slate-400",
        "focus:outline-none focus:ring-2 focus:ring-blue-500",
        "transition-all duration-200",
        error ? "ring-red-500" : "",
        className
      )}
      {...props}
    />
  );
});
