"use client";

import * as React from "react";
import * as SwitchPrimitive from "@radix-ui/react-switch";

import { cn } from "@/lib/utils";

function Switch({ className, ...props }: React.ComponentProps<typeof SwitchPrimitive.Root>) {
    return (
        <SwitchPrimitive.Root
            data-slot="switch"
            className={cn(
                "peer inline-flex h-[1.25rem] w-9 shrink-0 items-center rounded-full transition-all outline-none",
                "border border-[var(--color-border)] bg-[var(--color-input)]",
                "data-[state=checked]:bg-[var(--color-primary)]",
                "focus-visible:ring-[3px] focus-visible:ring-[var(--color-ring)]",
                "disabled:cursor-not-allowed disabled:opacity-50",
                className
            )}
            {...props}
        >
            <SwitchPrimitive.Thumb
                data-slot="switch-thumb"
                className={cn(
                    "pointer-events-none block size-[1rem] rounded-full transition-transform",
                    "data-[state=checked]:translate-x-[calc(100%-0.5px)] data-[state=unchecked]:translate-x-[2px]",
                    "data-[state=checked]:bg-white",
                    "data-[state=unchecked]:bg-[var(--color-foreground)]"
                )}
            />
        </SwitchPrimitive.Root>
    );
}

export { Switch };
