"use client";

import React, { useState, useEffect, useRef } from "react";
import { Play, Pause, SkipForward } from "lucide-react";
import ReactPlayer from "react-player";
import { motion, AnimatePresence } from "framer-motion";

interface CustomAudioPlayerProps {
    playlistUrl: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ReactPlayerAny = ReactPlayer as any;

export default function CustomAudioPlayer({ playlistUrl }: CustomAudioPlayerProps) {
    const [isPlaying, setIsPlaying] = useState(false);

    const [isReady, setIsReady] = useState(false);
    const [volume, setVolume] = useState(0.5);
    const [currentTrack, setCurrentTrack] = useState("Loading...");
    const [duration, setDuration] = useState(0);
    const [played, setPlayed] = useState(0);
    const [isFloating, setIsFloating] = useState(true); // Default to floating until we detect dock

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const playerRef = useRef<any>(null);
    const dockRef = useRef<HTMLDivElement>(null);

    // Toggle Play/Pause
    const togglePlay = () => setIsPlaying(!isPlaying);

    // Skip Track
    const handleNext = () => {
        if (playerRef.current) {
            const internalPlayer = playerRef.current.getInternalPlayer();
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            if (internalPlayer && (internalPlayer as any).nextVideo) {
                (internalPlayer as any).nextVideo();
            }
        }
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleProgress = (state: any) => {
        if (state.playedSeconds) setPlayed(state.playedSeconds);
    };

    const handleDuration = (d: number) => {
        setDuration(d);
    };

    const handleReady = () => {
        setIsReady(true);
        updateTrackInfo();
    };

    const updateTrackInfo = () => {
        const internalPlayer = playerRef.current?.getInternalPlayer();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if (internalPlayer && (internalPlayer as any).getVideoData) {
            const data = (internalPlayer as any).getVideoData();
            if (data && data.title) {
                setCurrentTrack(data.title);
            }
        }
    };

    useEffect(() => {
        const interval = setInterval(updateTrackInfo, 2000);
        return () => clearInterval(interval);
    }, []);

    // Scroll Observer for Docking
    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                // If dock is visible, disable floating
                setIsFloating(!entry.isIntersecting);
            },
            { threshold: 0.1 }
        );

        if (dockRef.current) {
            observer.observe(dockRef.current);
        }

        return () => {
            if (dockRef.current) {
                observer.unobserve(dockRef.current);
            }
        };
    }, []);

    const formatTime = (seconds: number) => {
        const min = Math.floor(seconds / 60);
        const sec = Math.floor(seconds % 60);
        return `${min}:${sec < 10 ? "0" + sec : sec}`;
    };

    const PlayerContent = (
        <div className={`p-4 bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl transition-all duration-500 group flex items-center gap-6 ${isFloating ? 'bg-black/60 shadow-black/50' : 'w-full max-w-2xl justify-between'}`}>

            {/* Hidden Player */}
            <div className="hidden">
                <ReactPlayerAny
                    ref={playerRef}
                    url={playlistUrl}
                    playing={isPlaying}
                    volume={volume}
                    controls={false}
                    width="0"
                    height="0"
                    onReady={handleReady}
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

            {/* Info */}
            <div className="flex flex-col min-w-[160px]">
                <span className="text-xs text-white/50 font-sans tracking-widest uppercase mb-1">Now Playing</span>
                <span className="text-sm text-white font-medium truncate max-w-[200px]">{currentTrack}</span>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-4">
                {/* Play/Pause */}
                <button
                    onClick={togglePlay}
                    className="w-12 h-12 flex items-center justify-center rounded-full bg-white text-black hover:bg-gray-200 transition-all shadow-lg hover:shadow-white/20 transform hover:scale-105 active:scale-95"
                >
                    {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-1" />}
                </button>

                {/* Next */}
                <button
                    onClick={handleNext}
                    className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                >
                    <SkipForward className="w-5 h-5 text-white" />
                </button>
            </div>

            {/* Time */}
            <div className="text-xs text-white/40 font-mono w-20 text-right">
                {formatTime(played)} / {formatTime(duration)}
            </div>
        </div>
    );

    return (
        <>
            {/* Docked Position (In Flow) */}
            <div ref={dockRef} className="w-full flex justify-center py-24 min-h-[300px] flex-col items-center">
                <h3 className="font-rockybilly text-4xl mb-8 text-center text-[#f5e6d3] opacity-80">Our Symphony</h3>
                {/* When docked (not floating), show player here */}
                <div className={`transition-opacity duration-500 ${!isFloating ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none h-0'}`}>
                    {!isFloating && PlayerContent}
                </div>
            </div>

            {/* Floating Position (Fixed) */}
            <AnimatePresence>
                {isFloating && (
                    <motion.div
                        initial={{ y: 100, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 100, opacity: 0 }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50"
                    >
                        {PlayerContent}
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
