import * as React from "react";
import { cn } from "@/lib/utils";

interface InputProps extends React.ComponentProps<"input"> {
    variant?: "default" | "success" | "warning" | "error";
    inputSize?: "sm" | "default" | "lg";
}

function Input({ className, type, variant = "default", inputSize = "default", ...props }: InputProps) {
    const variants = {
        default: [
            "border-border bg-input/50 text-foreground placeholder:text-muted-foreground",
            "focus-visible:border-primary focus-visible:ring-primary/20",
            "hover:border-border/80 hover:bg-input/70",
        ],
        success: [
            "border-success/50 bg-success/5 text-foreground placeholder:text-muted-foreground",
            "focus-visible:border-success focus-visible:ring-success/20",
            "hover:border-success/70",
        ],
        warning: [
            "border-warning/50 bg-warning/5 text-foreground placeholder:text-muted-foreground",
            "focus-visible:border-warning focus-visible:ring-warning/20",
            "hover:border-warning/70",
        ],
        error: [
            "border-destructive/50 bg-destructive/5 text-foreground placeholder:text-muted-foreground",
            "focus-visible:border-destructive focus-visible:ring-destructive/20",
            "hover:border-destructive/70",
        ],
    };

    const sizes = {
        sm: "h-8 px-2.5 py-1 text-xs rounded-md",
        default: "h-10 px-3 py-2 text-sm rounded-lg",
        lg: "h-12 px-4 py-3 text-base rounded-lg",
    };

    return (
        <input
            type={type}
            data-slot="input"
            className={cn(
                "flex w-full min-w-0 border shadow-sm backdrop-blur-sm transition-all duration-200",
                "selection:bg-primary selection:text-primary-foreground",
                "outline-none focus-visible:ring-2 focus-visible:ring-offset-0",
                "file:bg-muted/50 file:text-foreground file:inline-flex file:items-center file:border-0",
                "file:mr-3 file:rounded-md file:px-3 file:py-1.5 file:text-xs file:font-medium",
                "hover:file:bg-muted/70 file:transition-colors",
                "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
                "disabled:bg-muted/30 disabled:text-muted-foreground",
                "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40",
                "aria-invalid:border-destructive aria-invalid:bg-destructive/5",
                sizes[inputSize],
                variants[variant],
                className
            )}
            {...props}
        />
    );
}

export { Input };
