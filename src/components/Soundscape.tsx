"use client";

import React from "react";
import { motion } from "framer-motion";

interface SoundscapeProps {
    playlistUrl: string;
}

export default function Soundscape({ playlistUrl }: SoundscapeProps) {
    const [position, setPosition] = React.useState({ x: 0, y: 0 });
    const ref = React.useRef<HTMLDivElement>(null);

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!ref.current) return;
        const { left, top, width, height } = ref.current.getBoundingClientRect();
        const x = (e.clientX - (left + width / 2)) * 0.15; // Magnetic pull strength
        const y = (e.clientY - (top + height / 2)) * 0.15;
        setPosition({ x, y });
    };

    const handleMouseLeave = () => {
        setPosition({ x: 0, y: 0 });
    };

    return (
        <section className="w-full flex flex-col items-center justify-center py-24 px-6 relative z-20">
            <motion.div
                ref={ref}
                className="max-w-2xl w-full glass-panel p-8 rounded-3xl overflow-hidden cursor-none"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                animate={{ x: position.x, y: position.y }}
                transition={{ type: "spring", stiffness: 150, damping: 15 }}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
                viewport={{ once: true }}
            >
                <motion.div
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                >
                    <h3 className="font-serif text-3xl mb-6 text-center tracking-widest text-[#f5e6d3]">Our Symphony</h3>
                    <div className="relative w-full aspect-video md:aspect-[16/9] rounded-xl overflow-hidden bg-black/30 shadow-2xl border border-white/5">
                        <iframe
                            src={`${playlistUrl}&controls=1&modestbranding=1&rel=0&showinfo=0&loop=1`}
                            width="100%"
                            height="100%"
                            style={{ border: 0 }}
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            title="Valentine Playlist"
                            className="absolute inset-0 w-full h-full pointer-events-auto"
                        />
                        {/* Overlay to prevent interaction with non-play areas if desired, but we need play button access */}
                    </div>
                </motion.div>
            </motion.div>
        </section>
    );
}
