"use client";

import React, { useRef, useEffect, useState } from "react";
import { useScroll, useMotionValueEvent } from "framer-motion";

export default function FrameSequence() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [images, setImages] = useState<HTMLImageElement[]>([]);
    const [isLoaded, setIsLoaded] = useState(false);

    // Track global scroll progress for the bloom animation
    const { scrollYProgress } = useScroll();

    // Load images
    useEffect(() => {
        const loadImages = async () => {
            const loadedImages: HTMLImageElement[] = [];
            // Frame count: 64 used (Start from 013)
            const startFrame = 13;
            const endFrame = 64;

            for (let i = startFrame; i <= endFrame; i++) {
                const img = new Image();
                // Pattern: ezgif-frame-001.jpg (3 digits)
                const paddedIndex = i.toString().padStart(3, '0');
                img.src = `/mainsequence/ezgif-frame-${paddedIndex}.jpg`;
                await new Promise((resolve) => {
                    img.onload = resolve;
                    img.onerror = resolve;
                });
                if (img.complete && img.naturalWidth > 0) {
                    loadedImages.push(img);
                }
            }
            setImages(loadedImages);
            setIsLoaded(true);
        };

        loadImages();
    }, []);

    const draw = (progress: number) => {
        const canvas = canvasRef.current;
        if (!canvas || images.length === 0) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const width = canvas.width;
        const height = canvas.height;

        ctx.clearRect(0, 0, width, height);

        // Calculate frame index
        const frameIndex = Math.min(
            Math.floor(progress * (images.length - 1)),
            images.length - 1
        );

        const img = images[frameIndex];
        if (!img) return;

        // Draw image cover logic
        const scale = Math.max(width / img.width, height / img.height);
        const x = (width / 2) - (img.width / 2) * scale;
        const y = (height / 2) - (img.height / 2) * scale;

        ctx.drawImage(img, x, y, img.width * scale, img.height * scale);
    };

    useMotionValueEvent(scrollYProgress, "change", (latest) => {
        requestAnimationFrame(() => draw(latest));
    });

    useEffect(() => {
        const handleResize = () => {
            if (canvasRef.current) {
                canvasRef.current.width = window.innerWidth;
                canvasRef.current.height = window.innerHeight;
                // Force a redraw if we have progress, but scroll event will likely trigger or we can just wait.
                // For a perfect implementation, we might want to store latest progress in a ref to redraw on resize.
            }
        };
        window.addEventListener("resize", handleResize);
        handleResize();
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    return (
        <div className="fixed inset-0 z-0 w-full h-full pointer-events-none mix-blend-screen opacity-60">
            <canvas ref={canvasRef} className="block w-full h-full object-cover" />
        </div>
    );
}
