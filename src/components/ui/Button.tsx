import { motion, type HTMLMotionProps } from "framer-motion";
import { cn } from "../../lib/utils";

interface ButtonProps extends HTMLMotionProps<"button"> {
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg" | "icon";
  isLoading?: boolean;
}

const variants = {
  primary: "bg-orange-500 text-white hover:bg-orange-600 shadow-orange-500/20",
  secondary: "bg-blue-600 text-white hover:bg-blue-700 shadow-blue-600/20",
  outline: "bg-white text-green-600 border border-green-200 hover:bg-green-50",
  ghost: "bg-transparent text-slate-600 hover:bg-slate-100 shadow-none border-none"
};

const sizes = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-6 py-3",
  lg: "px-8 py-4 text-lg",
  icon: "p-2 aspect-square"
};

export const Button = ({ 
  className, 
  variant = "primary",
  size = "md",
  isLoading,
  children, 
  ...props 
}: ButtonProps) => {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={cn(
        "rounded-full font-bold shadow-lg transition-all duration-200 flex items-center justify-center gap-2",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        variants[variant],
        sizes[size],
        className
      )}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading ? (
        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
      ) : children}
    </motion.button>
  );
};
