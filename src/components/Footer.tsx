"use client";

import React from "react";

export default function Footer() {
    return (
        <footer className="w-full py-12 flex flex-col items-center justify-center relative z-20 text-white/50">
            <p className="font-serif italic text-lg opacity-80">Built with ❤️ by Brightmac</p>
            <div className="w-12 h-[1px] bg-white/20 my-4"></div>
            <p className="font-sans text-xs tracking-widest uppercase">&copy; Copyrights Brightmac 2026</p>
        </footer>
    );
}
