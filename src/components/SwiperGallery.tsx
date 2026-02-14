"use client";

import React from "react";
import Image from "next/image";

interface SwiperGalleryProps {
    images: string[];
}

const CAPTIONS = [
    "Quiet moments with you",
    "Strength and grace",
    "Building your dreams",
    "Every chapter with you",
    "Unstoppable spirit",
    "Boss moves only"
];

export default function SwiperGallery({ images }: SwiperGalleryProps) {
    // Rotations to alternate through for that natural "fanned" look
    const rotations = ["rotate-6", "-rotate-12", "rotate-6", "-rotate-12", "rotate-3", "-rotate-3"];

    return (
        <section className="min-h-screen w-full flex flex-col items-center justify-center py-24 px-4 overflow-hidden relative z-20">
            <h2 className="font-serif text-4xl md:text-5xl mb-24 text-center text-white/90 drop-shadow-lg">Moments</h2>

            {/* Gallery Container */}
            <div className="flex flex-col sm:flex-row items-center justify-center mx-auto gap-12 sm:gap-0 max-w-7xl perspective-1000">
                {images.map((src, index) => (
                    <div
                        key={index}
                        className={`
                            group
                            relative w-64 h-80 sm:w-72 sm:h-96 shrink-0
                            transform origin-bottom transition-all duration-500 ease-out
                            rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)]
                            ${rotations[index % rotations.length]}
                            hover:rotate-0 hover:-translate-y-12 hover:scale-110 hover:z-50 hover:shadow-[0_30px_60px_rgba(0,0,0,0.8)]
                            sm:-ml-12 first:ml-0
                        `}
                    >
                        {/* Card Content */}
                        <div className="relative w-full h-full rounded-2xl overflow-hidden border-4 border-white/10 bg-black/20 backdrop-blur-sm">
                            <Image
                                src={src}
                                alt={`Moment ${index + 1}`}
                                fill
                                className="object-cover"
                            />

                            {/* Overlay Gradient */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60"></div>

                            {/* Premium Glare Effect */}
                            <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/30 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none mix-blend-overlay"></div>
                        </div>

                        {/* Caption (Below the card) */}
                        <div className="absolute -bottom-20 left-1/2 -translate-x-1/2 w-80 text-center pointer-events-none z-50">
                            <p className="font-royal text-3xl text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-2 group-hover:translate-y-0">
                                {CAPTIONS[index % CAPTIONS.length]}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}
