"use client";
import * as React from "react";
import * as LabelPrimitive from "@radix-ui/react-label";
import { cn } from "@/lib/utils";

interface LabelProps extends React.ComponentProps<typeof LabelPrimitive.Root> {
    variant?: "default" | "required" | "optional" | "success" | "warning" | "error";
    size?: "sm" | "default" | "lg";
}

function Label({ className, variant = "default", size = "default", children, ...props }: LabelProps) {
    const variants = {
        default: "text-foreground/90",
        required: "text-foreground/90 after:content-['*'] after:text-destructive after:ml-1 after:font-bold",
        optional: "text-muted-foreground after:content-['(optional)'] after:text-xs after:ml-2 after:font-normal",
        success: "text-success",
        warning: "text-warning",
        error: "text-destructive"
    };

    const sizes = {
        sm: "text-xs",
        default: "text-sm",
        lg: "text-base"
    };

    return (
        <LabelPrimitive.Root
            data-slot="label"
            className={cn(
                // Base styles
                "flex items-center gap-2 leading-none font-medium select-none transition-colors",
                "group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50",
                "peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
                
                // Interactive states
                "hover:text-foreground focus:text-foreground",
                "cursor-pointer",
                
                // Size variants
                sizes[size],
                
                // Color variants
                variants[variant],
                
                className
            )}
            {...props}
        >
            {children}
        </LabelPrimitive.Root>
    );
}

export { Label };