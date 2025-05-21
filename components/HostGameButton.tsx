// button for hosting a game
// includes difficulty UI

"use client";

import { useState, useRef, useEffect } from "react";

export type Difficulty = "easy" | "medium" | "hard";

export default function HostGameButton({
    onHost,
}: {
    onHost: (level: Difficulty) => void;
}) {
    const [open, setOpen] = useState(false);
    const [level, setLevel] = useState<Difficulty>("easy");
    const popover = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!open) return;
        const close = (e: MouseEvent) => {
            if (popover.current && !popover.current.contains(e.target as Node)) {
                setOpen(false);
            }
        };
        window.addEventListener("mousedown", close);
        return () => window.removeEventListener("mousedown", close);
    }, [open]);

    return (
        <div className="relative">
            {/* primary trigger */}
            <button
                onClick={() => setOpen(!open)}
                className="w-full py-3 rounded-xl font-medium
                   bg-cyan-500/90 hover:bg-cyan-400 transition-colors
                   focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300"
            >
                Host new game
            </button>

            {open && (
                <div
                    ref={popover}
                    className="absolute inset-x-0 top-full z-50 mt-2
                     rounded-xl bg-slate-800/95 backdrop-blur-md shadow-lg
                     ring-1 ring-slate-700/60 p-4 space-y-4"
                >
                    <p className="text-sm font-semibold text-slate-200">Difficulty</p>

                    <div className="grid grid-cols-3 gap-2">
                        {(["easy", "medium", "hard"] as Difficulty[]).map((d) => (
                            <button
                                key={d}
                                onClick={() => setLevel(d)}
                                className={`py-2 text-sm font-medium capitalize rounded-lg transition
                  ${level === d
                                        ? "bg-cyan-500/90 text-white ring-2 ring-cyan-300"
                                        : "bg-slate-700 hover:bg-slate-600 text-slate-200"
                                    }`}
                            >
                                {d}
                            </button>
                        ))}
                    </div>

                    <button
                        onClick={() => {
                            console.log("Hosting at level:", level);   // should appear in console
                            onHost(level);
                            setOpen(false);
                        }}
                        className="w-full py-2 rounded-lg
                       bg-emerald-500/90 hover:bg-emerald-400
                       font-semibold transition-colors"
                    >
                        Start game
                    </button>
                </div>
            )}
        </div>
    );
}