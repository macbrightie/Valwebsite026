"use client";

import React, { useState, useEffect, useRef } from "react";
import { Play, Pause, SkipForward, SkipBack, Volume2 } from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { EffectCoverflow, Pagination, Navigation } from "swiper/modules";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

import "swiper/css";
import "swiper/css/effect-coverflow";
import "swiper/css/pagination";
import "swiper/css/navigation";

// --- Data ---
// TELEGRAM AUDIO BACKEND
// 1. Upload your MP3s to your Telegram Bot.
// 2. Get the 'file_id' for each song (using the helper script or API).
// 3. Paste them below.
// 4. The /api/telegram-audio route handles the secure streaming.

const PLAYLIST_DATA = [
    {
        title: "When a Man Loves a Woman",
        artist: "Percy Sledge",
        coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music/52/82/b4/mzi.rpbsgiwt.jpg/600x600bb.jpg",
        audioUrl: "/api/telegram-audio?file_id=CQACAgQAAxkBAAMFaZAeyx1LOZUjfVbQ0ba1ktoQGo0AAn8gAALvU4BQv_NPWKRVQmQ6BA",
    },
    {
        title: "Be My Baby",
        artist: "The Ronettes",
        coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/94/45/82/94458262-998b-3a64-5461-b9230a55643e/mzi.xefbhabm.jpg/600x600bb.jpg",
        audioUrl: "/api/telegram-audio?file_id=CQACAgQAAxkBAAMGaZAey_ntLVnh-OdvRMlR_8WCX1kAAoAgAALvU4BQTvL3py0QcyA6BA",
    },
    {
        title: "Sweetness",
        artist: "Elliot James Reay",
        coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/83/f3/c3/83f3c3cc-fdf2-8205-f225-732e3c353946/25UMGIM79759.rgb.jpg/600x600bb.jpg",
        audioUrl: "/api/telegram-audio?file_id=CQACAgQAAxkBAAMHaZAey82cbR9HtryuXkelruhXEIMAAoEgAALvU4BQbcfQ_ZXReJk6BA",
    },
    {
        title: "Can't Help Falling in Love",
        artist: "Elvis Presley",
        coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/ec/14/ea/ec14ea7c-7886-5757-5837-6ea26c0e4e7d/dj.qusytvtz.jpg/600x600bb.jpg",
        audioUrl: "/api/telegram-audio?file_id=CQACAgQAAxkBAAMIaZAey-dmszVWURulNjJ3GmpKgJIAAoIgAALvU4BQBIHMwPE0CJM6BA",
    },
    {
        title: "In the Still of the Night",
        artist: "The Five Satins",
        coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music/fe/a5/77/mzi.qdnoiugs.jpg/600x600bb.jpg",
        audioUrl: "/api/telegram-audio?file_id=CQACAgQAAxkBAAMJaZAe5pKCVD-7pMLKZ2qnFRo7Q7YAAoMgAALvU4BQlNVTqIBLljg6BA",
    },
    {
        title: "I Love You Baby",
        artist: "Frank Sinatra",
        coverUrl: "https://images.unsplash.com/photo-1514525253440-b393452e8d26?q=80&w=200&auto=format&fit=crop",
        audioUrl: "/api/telegram-audio?file_id=CQACAgQAAxkBAAMKaZAowftzXkruiJAbZEArGzS9WvUAAoggAALvU4BQqQrzim0lb_E6BA",
    },
];

interface ImmersivePlayerProps {
    playlistUrl?: string; // Kept for compat
    autoStart?: boolean;
}

export default function ImmersivePlayer({ autoStart = false }: ImmersivePlayerProps) {
    // --- State ---
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
    const [volume, setVolume] = useState(0.8);
    const [progress, setProgress] = useState(0); // 0 to 1
    const [duration, setDuration] = useState(0); // in seconds
    const [isFloating, setIsFloating] = useState(true); // Default to Floating (Visible at start)
    const [hasMounted, setHasMounted] = useState(false);

    // --- Refs ---
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const dockRef = useRef<HTMLDivElement>(null);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const swiperRef = useRef<any>(null);

    // --- Effects ---

    // 1. Mount Check
    useEffect(() => { setHasMounted(true); }, []);

    // 2. Playback Logic
    useEffect(() => {
        if (!audioRef.current) return;

        if (isPlaying) {
            // Basic play attempt
            const playPromise = audioRef.current.play();
            if (playPromise !== undefined) {
                playPromise.catch((error) => {
                    console.error("Autoplay prevented:", error);
                    setIsPlaying(false);
                });
            }
        } else {
            audioRef.current.pause();
        }
    }, [isPlaying, currentTrackIndex]);

    // 3. AutoStart
    useEffect(() => {
        if (autoStart) {
            setIsPlaying(true);
        }
    }, [autoStart]);

    // 4. Volume
    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.volume = volume;
        }
    }, [volume]);

    // 5. Scroll Observer
    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                // Logic:
                // 1. If we see the player section (even partially), SNAP/DOCK it.
                // 2. If we scroll past it (it's above us), FLOAT it.
                // 3. If we are above it (it's below us), DOCK it (hidden).

                if (entry.isIntersecting) {
                    setIsFloating(false); // Snap to dock when visible
                } else {
                    // If not intersecting, check where it is relative to viewport
                    if (entry.boundingClientRect.top < 0) {
                        setIsFloating(true); // We scrolled past it -> Float
                    } else {
                        setIsFloating(false); // It's below us -> Keep docked/hidden
                    }
                }
            },
            {
                threshold: 0.1, // Trigger when 10% is visible
            }
        );
        if (dockRef.current) observer.observe(dockRef.current);
        return () => observer.disconnect();
    }, []);

    // --- Handlers ---

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleSlideChange = (swiper: any) => {
        setCurrentTrackIndex(swiper.activeIndex);
        setIsPlaying(true); // Auto-play when manually changing slide
    };

    const togglePlay = () => setIsPlaying(!isPlaying);

    const handleNext = () => {
        if (swiperRef.current?.swiper) {
            const nextIndex = (currentTrackIndex + 1) % PLAYLIST_DATA.length;
            swiperRef.current.swiper.slideTo(nextIndex);
        }
    };

    const handlePrev = () => {
        if (swiperRef.current?.swiper) {
            const prevIndex = (currentTrackIndex - 1 + PLAYLIST_DATA.length) % PLAYLIST_DATA.length;
            swiperRef.current.swiper.slideTo(prevIndex);
        }
    };

    const handleTimeUpdate = () => {
        if (audioRef.current) {
            const current = audioRef.current.currentTime;
            const dur = audioRef.current.duration;
            if (dur > 0) {
                setProgress(current / dur);
            }
            setDuration(dur || 0);
        }
    };

    const handleLoadedMetadata = () => {
        if (audioRef.current) {
            setDuration(audioRef.current.duration);
        }
    };

    const handleEnded = () => {
        handleNext();
    };

    const formatTime = (seconds: number) => {
        if (!seconds || isNaN(seconds)) return "0:00";
        const min = Math.floor(seconds / 60);
        const sec = Math.floor(seconds % 60);
        return `${min}:${sec < 10 ? "0" + sec : sec}`;
    };

    const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!audioRef.current) return;
        const progressBar = e.currentTarget;
        const clickPosition = (e.clientX - progressBar.getBoundingClientRect().left) / progressBar.offsetWidth;

        const newTime = clickPosition * duration;
        audioRef.current.currentTime = newTime;
        setProgress(clickPosition);
    };


    if (!hasMounted) return null;

    return (
        <>
            {/* HTML5 Audio Element (No Visuals Needed) */}
            <audio
                ref={audioRef}
                src={PLAYLIST_DATA[currentTrackIndex]?.audioUrl}
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                onEnded={handleEnded}
                preload="auto"
                className="hidden"
            />

            {/* --- MAIN SECTION (Docking Area) --- */}
            <section ref={dockRef} className="relative w-full min-h-[90vh] flex flex-col items-center justify-center py-20">
                {/* 3D Album Art Carousel */}
                <div className="relative w-full max-w-6xl z-10 px-4 flex flex-col items-center">
                    <Swiper
                        ref={swiperRef}
                        effect={'coverflow'}
                        grabCursor={true}
                        centeredSlides={true}
                        slidesPerView={'auto'}
                        coverflowEffect={{
                            rotate: 35,
                            stretch: 0,
                            depth: 250,
                            scale: 0.85,
                            modifier: 1,
                            slideShadows: false,
                        }}
                        pagination={false}
                        modules={[EffectCoverflow, Pagination, Navigation]}
                        onSlideChange={handleSlideChange}
                        className="w-full h-[350px] md:h-[500px] !overflow-visible"
                    >
                        {PLAYLIST_DATA.map((song, index) => (
                            <SwiperSlide key={index} className="!w-[300px] md:!w-[450px] !h-[300px] md:!h-[450px] aspect-square rounded-[32px] overflow-hidden shadow-2xl transition-all duration-500">
                                <div className={`relative w-full h-full bg-black/20 border border-white/10 ${index === currentTrackIndex ? 'ring-1 ring-white/20' : 'opacity-60 saturate-0'}`}>
                                    <Image src={song.coverUrl} alt={song.title} fill className="object-cover" />
                                </div>
                            </SwiperSlide>
                        ))}
                    </Swiper>

                    {/* Song Title Capsule */}
                    <div className="mt-8 mb-4 px-6 py-3 bg-black/60 backdrop-blur-md border border-white/10 rounded-full flex flex-col items-center justify-center text-center shadow-2xl z-20">
                        <h3 className="text-white text-lg font-medium tracking-wide">{PLAYLIST_DATA[currentTrackIndex]?.title}</h3>
                        <p className="text-white/50 text-sm">{PLAYLIST_DATA[currentTrackIndex]?.artist}</p>
                    </div>
                </div>

                {/* --- CONTROL BAR --- */}
                <AnimatePresence>
                    <motion.div
                        layout
                        initial={false}
                        className={`
                            z-[10001] pointer-events-auto h-20 md:h-24 bg-black/40 backdrop-blur-3xl border border-white/10 rounded-[40px] flex items-center justify-between px-6 md:px-8 shadow-2xl overflow-hidden
                            ${isFloating
                                ? "fixed bottom-8 left-1/2 -translate-x-1/2 w-[90%] max-w-[36rem] shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
                                : "relative mt-4 w-[95%] max-w-[48rem]"
                            }
                        `}
                    >
                        {/* Playback Controls */}
                        <div className="flex items-center gap-4 md:gap-6">
                            <button onClick={handlePrev} className="text-white/70 hover:text-white transition-colors hover:scale-110 active:scale-95">
                                <SkipBack className="w-5 h-5 md:w-6 md:h-6 fill-current" />
                            </button>

                            <button onClick={togglePlay} className="text-white hover:scale-110 active:scale-95 transition-transform">
                                <div className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center bg-white text-black rounded-full shadow-lg hover:shadow-white/20">
                                    {isPlaying ? <Pause className="w-5 h-5 md:w-6 md:h-6 fill-current" /> : <Play className="w-5 h-5 md:w-6 md:h-6 fill-current ml-1" />}
                                </div>
                            </button>

                            <button onClick={handleNext} className="text-white/70 hover:text-white transition-colors hover:scale-110 active:scale-95">
                                <SkipForward className="w-5 h-5 md:w-6 md:h-6 fill-current" />
                            </button>
                        </div>

                        {/* Info & Scrubbing */}
                        <div className="flex-1 flex items-center justify-center gap-4 px-4 h-full">
                            <div className="hidden md:block relative w-10 h-10 md:w-12 md:h-12 rounded-lg overflow-hidden shadow-md shrink-0 border border-white/10">
                                <Image src={PLAYLIST_DATA[currentTrackIndex]?.coverUrl} alt="Art" fill className="object-cover" />
                            </div>

                            <div className="flex flex-col w-full max-w-[200px] md:max-w-[280px] gap-1.5 align-middle justify-center">
                                <div className="flex items-center justify-between text-xs text-white/60 font-medium tracking-wide">
                                    <span className="truncate max-w-[100px] md:max-w-[150px] text-white/90">{PLAYLIST_DATA[currentTrackIndex]?.title}</span>
                                    <span className="font-mono text-white/40">{formatTime(progress * duration)}</span>
                                </div>

                                <div
                                    onClick={handleSeek}
                                    className="w-full h-1 bg-white/10 rounded-full cursor-pointer group relative overflow-hidden"
                                >
                                    <motion.div
                                        className="absolute top-0 left-0 h-full bg-white rounded-full group-hover:bg-rose-500 transition-colors"
                                        style={{ width: `${(progress || 0) * 100}%` }}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Volume */}
                        <div className="flex items-center gap-3 relative group pl-2">
                            <Volume2 className="w-4 h-4 md:w-5 md:h-5 text-white/50 group-hover:text-white transition-colors" />
                            <div className="w-0 overflow-hidden group-hover:w-16 md:group-hover:w-20 transition-all duration-300 ease-out flex items-center">
                                <input
                                    type="range"
                                    min={0}
                                    max={1}
                                    step={0.05}
                                    value={volume}
                                    onChange={(e) => setVolume(parseFloat(e.target.value))}
                                    className="w-12 md:w-16 h-1 bg-white/20 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-2.5 [&::-webkit-slider-thumb]:h-2.5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white"
                                />
                            </div>
                            <div className={`w-1.5 h-1.5 md:w-2 md:h-2 rounded-full transition-colors duration-500 ${isPlaying ? 'bg-green-500 animate-pulse shadow-[0_0_10px_#22c55e]' : 'bg-red-500/20'}`} />
                        </div>

                    </motion.div>
                </AnimatePresence>
            </section>
        </>
    );
}
