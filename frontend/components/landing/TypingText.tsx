"use client";

import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { useEffect } from "react";

export function TypingText({ texts }: { texts: string[] }) {
    const textIndex = useMotionValue(0);
    const baseText = useTransform(textIndex, (latest) => texts[latest] || "");
    const count = useMotionValue(0);
    const rounded = useTransform(count, (latest) => Math.round(latest));
    const displayText = useTransform(rounded, (latest) => baseText.get().slice(0, latest));

    useEffect(() => {
        const controls = animate(count, 60, {
            type: "tween",
            duration: 3,
            ease: "easeInOut",
            repeat: Infinity,
            repeatType: "reverse",
            repeatDelay: 1,
            onUpdate(latest) {
                if (latest === 0) {
                    textIndex.set((textIndex.get() + 1) % texts.length);
                }
            },
        });
        return controls.stop;
    }, []);

    return (
        <span className="inline-block relative">
            <motion.span>{displayText}</motion.span>
            <motion.span
                animate={{ opacity: [0, 1, 0] }}
                transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                className="inline-block w-1 h-8 ml-1 align-middle bg-purple-500 rounded-full"
            />
        </span>
    );
}
