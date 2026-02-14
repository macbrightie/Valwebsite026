"use client";

import React from "react";
import { motion } from "framer-motion";
import Image from "next/image";

interface BentoGalleryProps {
    images: string[];
}

export default function BentoGallery({ images }: BentoGalleryProps) {
    return (
        <section className="min-h-screen w-full flex flex-col items-center justify-center py-20 px-4 relative z-20">
            <h2 className="font-serif text-4xl md:text-6xl mb-12 text-center text-white/90">Moments in Time</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-6xl auto-rows-[300px]">
                {images.map((src, i) => (
                    <motion.div
                        key={i}
                        className={`relative rounded-2xl overflow-hidden glass-panel group ${i === 0 || i === 3 ? "md:col-span-2" : "md:col-span-1"
                            }`}
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5, delay: i * 0.1 }}
                        viewport={{ once: true }}
                        whileHover={{ scale: 1.02, boxShadow: "0 0 30px rgba(255,200,200,0.2)" }}
                    >
                        <Image
                            src={src}
                            alt={`Gallery image ${i + 1}`}
                            fill
                            className="object-cover transition-transform duration-700 group-hover:scale-110"
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                        <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors duration-500" />
                    </motion.div>
                ))}
            </div>
        </section>
    );
}
