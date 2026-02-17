"use client";

import { motion } from "framer-motion";
import { Button, ButtonProps } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import React from "react";

interface AnimatedButtonProps extends ButtonProps {
    children: React.ReactNode;
}

export function AnimatedButton({ children, className, ...props }: AnimatedButtonProps) {
    return (
        <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
        >
            <Button
                className={cn(
                    "relative overflow-hidden transition-all duration-300",
                    className
                )}
                {...props}
            >
                {children}
            </Button>
        </motion.div>
    );
}
