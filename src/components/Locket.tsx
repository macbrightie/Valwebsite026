"use client";

import React from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import Image from "next/image";

interface LocketProps {
    imageSrc: string;
}

export default function Locket({ imageSrc }: LocketProps) {
    const { scrollY } = useScroll();

    // Transform ranges
    // 0 to 600px of scroll determines the transition
    const width = useTransform(scrollY, [0, 600], ["100vw", "120px"]);
    const height = useTransform(scrollY, [0, 600], ["100vh", "120px"]);
    const top = useTransform(scrollY, [0, 600], ["0px", "24px"]);
    const right = useTransform(scrollY, [0, 600], ["0px", "24px"]); // pinned to right
    const borderRadius = useTransform(scrollY, [0, 600], ["0px", "60px"]); // 50% of 120px
    const opacity = useTransform(scrollY, [0, 100], [0.6, 1]); // Brighten up as it becomes a locket? Or stay constant.
    // Actually, hero image is usually darkened for text readability. 
    // Let's keep it opaque or slightly dimmed initially, then full opacity as locket.

    // Border glow
    const border = useTransform(
        scrollY,
        [0, 600],
        ["0px solid rgba(255,215,0,0)", "2px solid rgba(255,215,0,0.5)"]
    );

    const boxShadow = useTransform(
        scrollY,
        [0, 600],
        ["none", "0 0 30px rgba(255,215,0,0.2)"]
    );

    return (
        <motion.div
            style={{
                position: "fixed",
                top,
                right,
                width,
                height,
                borderRadius,
                border,
                boxShadow,
                zIndex: 40,
                overflow: "hidden"
            }}
            animate={{
                boxShadow: ["0 0 20px rgba(255,215,0,0.2)", "0 0 40px rgba(255,215,0,0.5)", "0 0 20px rgba(255,215,0,0.2)"]
            }}
            transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut"
            }}
            className="bg-black transform-gpu"
        >
            <Image
                src={imageSrc}
                alt="Muse"
                fill
                className="object-cover"
                priority
            />

            {/* Optional: Overlay that fades out */}
            <motion.div
                className="absolute inset-0 bg-black/40"
                style={{ opacity: useTransform(scrollY, [0, 300], [1, 0]) }}
            />
        </motion.div>
    );
}
