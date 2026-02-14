"use client";
import React from "react";
import { ReactLenis } from 'lenis/react';
import { motion, useScroll, AnimatePresence } from "framer-motion";
import CinematicLetter from "@/components/CinematicLetter";
import SwiperGallery from "@/components/SwiperGallery";
import ImmersivePlayer from "@/components/ImmersivePlayer";
import Footer from "@/components/Footer";
import FrameSequence from "@/components/FrameSequence";
import CustomCursor from "@/components/CustomCursor";

// --- Configuration ---
export const VALENTINE_DATA = {
  heroImage: "https://images.unsplash.com/photo-1518621736915-f3b1c41bfd00?q=80&w=3786&auto=format&fit=crop", // Rose/Dark theme
  galleryImages: [
    "/assets/moment-1.jpg",
    "/assets/moment-2.jpg",
    "/assets/moment-3.jpg",
    "/assets/moment-4.jpg",
  ],
  loveLetter: `My Muse,\n\nIn the quiet moments of the night, when the world fades away, it is your light that guides me.\n\nEvery smile you share is a sunrise, every laugh a melody that lingers in my heart. You are the muse behind my every thought, the poetry in my silence.\n\nThis digital rose is but a small reflection of the beauty you bring into my life. Forever yours.`,
  playlistURL: "https://www.youtube.com/embed/videoseries?list=PLat6rsZorsYyU0daHA6Jl7mVACF_LJyIw" // Updated Playlist
};

export default function Home() {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  const [hasEntered, setHasEntered] = React.useState(false);
  // ... (keep logic)

  // Hydration fix: Generate particles only on client
  const [particles, setParticles] = React.useState<Array<{ top: string; left: string; width: string; height: string; delay: string; duration: string; glow: string }>>([]);

  React.useEffect(() => {
    const newParticles = Array.from({ length: 50 }).map(() => ({
      top: `${Math.random() * 100}vh`,
      left: `${Math.random() * 100}vw`,
      width: `${Math.random() * 6 + 4}px`,
      height: `${Math.random() * 6 + 4}px`,
      delay: `${Math.random() * 10}s`,
      duration: `${10 + Math.random() * 10}s`,
      glow: `0 0 ${Math.random() * 20 + 10}px rgba(255, 180, 0, ${Math.random() * 0.4 + 0.6})`
    }));
    setParticles(newParticles);
  }, []);

  return (
    <ReactLenis root>
      <main ref={containerRef} className="relative w-full">

        {/* Entry Overlay */}
        <AnimatePresence>
          {!hasEntered && (
            <motion.div
              initial={{ opacity: 1 }}
              exit={{ opacity: 0, transition: { duration: 1, ease: "easeInOut" } }}
              className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center p-4 cursor-pointer"
              onClick={() => setHasEntered(true)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 1.5, repeat: Infinity, repeatType: "reverse" }}
                className="text-center"
              >
                <h2 className="font-rustic text-4xl md:text-6xl text-white mb-4 tracking-widest">For You</h2>
                <p className="font-mono text-xs text-white/50 tracking-[0.3em] uppercase">Tap to Open</p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grain-overlay"></div>

        {/* Frame Sequence (Background) */}
        <FrameSequence />

        {/* Particle Background Layer (Golden Fireflies) - Increased Visibility */}
        <div className="fixed inset-0 z-10 pointer-events-none overflow-hidden">
          {particles.map((p, i) => (
            <div
              key={i}
              className="particle rounded-full bg-amber-300"
              style={{
                top: p.top,
                left: p.left,
                width: p.width,
                height: p.height,
                animationDelay: p.delay,
                animationDuration: p.duration,
                boxShadow: p.glow,
                opacity: 0.8
              }}
            />
          ))}
        </div>

        {/* Hero Text Content */}
        <section className="h-screen w-full flex flex-col items-center justify-center relative z-50 pointer-events-none">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: hasEntered ? 1 : 0, y: hasEntered ? 0 : 20 }}
            transition={{ duration: 1, delay: 0.5 }}
            className="text-center"
          >
            <h1 className="font-rustic text-6xl md:text-9xl mb-4 tracking-tighter drop-shadow-lg text-white">Because i think of you</h1>
            <p className="font-sans text-xl opacity-80 tracking-[0.2em] uppercase text-sm drop-shadow-md">Scroll to begin</p>
          </motion.div>
        </section>

        {/* Cinematic Letter */}
        <CinematicLetter content={VALENTINE_DATA.loveLetter} />

        {/* Swiper Gallery */}
        <SwiperGallery images={VALENTINE_DATA.galleryImages} />

        {/* Immersive 3D Player */}
        <ImmersivePlayer playlistUrl={VALENTINE_DATA.playlistURL} autoStart={hasEntered} />

        {/* Footer */}
        <Footer />

        {/* Cursor - Placed last for highest Z-Index stacking */}
        <CustomCursor />
      </main>
    </ReactLenis>
  );
}
