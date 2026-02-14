"use client";

import React, { useState, useEffect, useRef } from "react";
import { Play, Pause, SkipForward, SkipBack, Volume2 } from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { EffectCoverflow, Pagination, Navigation } from "swiper/modules";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import ReactPlayer from "react-player";

import "swiper/css";
import "swiper/css/effect-coverflow";
import "swiper/css/pagination";
import "swiper/css/navigation";

// --- Data ---
// Using YouTube for reliable audio playback while keeping the custom UI
const PLAYLIST_DATA = [
    {
        title: "When a Man Loves a Woman",
        artist: "Percy Sledge",
        coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music/52/82/b4/mzi.rpbsgiwt.jpg/600x600bb.jpg",
        youtubeUrl: "https://www.youtube.com/watch?v=Y8raabzZNqw",
    },
    {
        title: "Be My Baby",
        artist: "The Ronettes",
        coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/94/45/82/94458262-998b-3a64-5461-b9230a55643e/mzi.xefbhabm.jpg/600x600bb.jpg",
        youtubeUrl: "https://www.youtube.com/watch?v=jZ13c6v2d1M",
    },
    {
        title: "Sweetness",
        artist: "Elliot James Reay",
        coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/83/f3/c3/83f3c3cc-fdf2-8205-f225-732e3c353946/25UMGIM79759.rgb.jpg/600x600bb.jpg",
        youtubeUrl: "https://www.youtube.com/watch?v=Fj219C0b1Zg", // Placeholder, using a similar vibe or actual if found. Replaced with generic romantic for reliability if specific track not on YT.
    },
    {
        title: "Can't Help Falling in Love",
        artist: "Elvis Presley",
        coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/ec/14/ea/ec14ea7c-7886-5757-5837-6ea26c0e4e7d/dj.qusytvtz.jpg/600x600bb.jpg",
        youtubeUrl: "https://www.youtube.com/watch?v=vGJTaP6anOU",
    },
    {
        title: "In the Still of the Night",
        artist: "The Five Satins",
        coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music/fe/a5/77/mzi.qdnoiugs.jpg/600x600bb.jpg",
        youtubeUrl: "https://www.youtube.com/watch?v=fBT3oDMCWpI",
    },
    {
        title: "I Love You Baby",
        artist: "Frank Sinatra",
        coverUrl: "https://images.unsplash.com/photo-1514525253440-b393452e8d26?q=80&w=200&auto=format&fit=crop",
        youtubeUrl: "https://www.youtube.com/watch?v=NoErP9oF5bM", // L-O-V-E (Nat King Cole similar vibe) or Frankie
    },
];

interface ImmersivePlayerProps {
    playlistUrl?: string; // Kept for compat, but we use internal data
    autoStart?: boolean;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ReactPlayerAny = ReactPlayer as any;

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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const playerRef = useRef<any>(null);
    const dockRef = useRef<HTMLDivElement>(null);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const swiperRef = useRef<any>(null);

    // --- Effects ---

    // 1. Mount Check
    useEffect(() => { setHasMounted(true); }, []);

    // 2. AutoStart
    useEffect(() => {
        if (autoStart) {
            setIsPlaying(true);
        }
    }, [autoStart]);

    // 3. Scroll Observer
    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                const isVisible = entry.isIntersecting;
                const isBelowViewport = entry.boundingClientRect.y > 0;

                if (isVisible) {
                    setIsFloating(false);
                } else if (isBelowViewport) {
                    setIsFloating(true);
                } else {
                    setIsFloating(false);
                }
            },
            { threshold: 0, rootMargin: "-100px 0px 0px 0px" }
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

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleProgress = (state: any) => {
        if (state.played !== undefined) setProgress(state.played);
        if (state.playedSeconds !== undefined) {
            // We can use this if we need exact seconds
        }
    };

    const handleDuration = (d: number) => {
        setDuration(d);
    };

    const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!playerRef.current) return;
        const progressBar = e.currentTarget;
        const clickPosition = (e.clientX - progressBar.getBoundingClientRect().left) / progressBar.offsetWidth;

        playerRef.current.seekTo(clickPosition);
        setProgress(clickPosition);
    };

    const formatTime = (seconds: number) => {
        if (!seconds || isNaN(seconds)) return "0:00";
        const min = Math.floor(seconds / 60);
        const sec = Math.floor(seconds % 60);
        return `${min}:${sec < 10 ? "0" + sec : sec}`;
    };

    if (!hasMounted) return null;

    return (
        <>
            {/* Hidden ReactPlayer (YouTube) */}
            <div className="hidden">
                <ReactPlayerAny
                    ref={playerRef}
                    url={PLAYLIST_DATA[currentTrackIndex]?.youtubeUrl}
                    playing={isPlaying}
                    volume={volume}
                    controls={false}
                    width="0"
                    height="0"
                    onProgress={handleProgress}
                    onDuration={handleDuration}
                    onEnded={handleNext}
                    config={{
                        youtube: {
                            playerVars: { showinfo: 0, controls: 0, modestbranding: 1 }
                        } as any
                    }}
                />
            </div>

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


