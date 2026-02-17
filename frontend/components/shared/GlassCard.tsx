"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import React from "react";

interface GlassCardProps {
    children: React.ReactNode;
    className?: string;
    hoverEffect?: boolean;
}

export function GlassCard({ children, className, hoverEffect = false }: GlassCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            whileHover={hoverEffect ? { y: -5, boxShadow: "0 20px 40px -15px rgba(126, 34, 206, 0.3)" } : {}}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className={cn(
                "relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl transition-colors",
                hoverEffect && "hover:bg-white/10 hover:border-purple-500/30",
                className
            )}
        >
            <div className="relative z-10">{children}</div>

            {/* Subtle Gradient Glow */}
            <div className="absolute -inset-1 z-0 bg-gradient-to-br from-purple-500/10 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
        </motion.div>
    );
}
