"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, useInView } from "framer-motion";

interface CinematicLetterProps {
    content: string;
}

// Typewriter Sound URL (Subtle UI Click/Pop)
const TYPEWRITER_SOUND_URL = "https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3"; // Soft Typewriter Single Key

export default function CinematicLetter({ content }: CinematicLetterProps) {
    const [started, setStarted] = useState(false);
    const containerRef = useRef(null);
    const isInView = useInView(containerRef, { once: true, margin: "-10% 0px -10% 0px" });

    // When scrolled into view, start the effect
    useEffect(() => {
        if (isInView && !started) {
            setStarted(true);
        }
    }, [isInView, started]);

    return (
        <section className="min-h-screen w-full flex items-center justify-center py-24 px-6 relative z-20">
            <div
                ref={containerRef}
                className="max-w-3xl w-full bg-black/40 backdrop-blur-xl border border-white/10 text-white p-12 md:p-16 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative overflow-hidden"
            >
                {/* Decorative border or sheen */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />

                {started && <TypewriterText content={content} audioUrl={TYPEWRITER_SOUND_URL} />}
            </div>
        </section>
    );
}

function TypewriterText({ content, audioUrl }: { content: string, audioUrl: string }) {
    const [displayedText, setDisplayedText] = useState("");
    const indexRef = useRef(0);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        // Initialize Audio
        audioRef.current = new Audio(audioUrl);
        audioRef.current.volume = 0.3; // Subtle volume
    }, [audioUrl]);

    useEffect(() => {
        const intervalId = setInterval(() => {
            if (indexRef.current < content.length) {
                const nextChar = content.charAt(indexRef.current);
                setDisplayedText((prev) => prev + nextChar);
                indexRef.current++;

                // Play sound on non-whitespace
                if (nextChar.trim() !== "" && audioRef.current) {
                    // Clone to allow rapid overlap or just reset time
                    const soundClone = audioRef.current.cloneNode() as HTMLAudioElement;
                    soundClone.volume = 0.2;
                    soundClone.play().catch(() => { }); // Ignore interaction errors
                }
            } else {
                clearInterval(intervalId);
            }
        }, 50); // Speed: 50ms per character

        return () => clearInterval(intervalId);
    }, [content]);

    return (
        <div className="font-royal text-3xl md:text-5xl leading-relaxed mb-8 text-center text-white/90 drop-shadow-md whitespace-pre-wrap">
            {displayedText}
            <motion.span
                animate={{ opacity: [0, 1, 0] }}
                transition={{ duration: 0.8, repeat: Infinity }}
                className="inline-block w-1 h-8 md:h-12 bg-white ml-1 align-middle"
            />
        </div>
    );
}
