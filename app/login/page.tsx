"use client";

import React from "react";
import { signInAnonymously } from "./actions";

export default function LoginPage() {
    return (
        <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 text-slate-100">
            <section className="w-[min(100%_,24rem)] mx-4 rounded-3xl bg-slate-900/60 backdrop-blur p-8 shadow-2xl ring-1 ring-slate-700/40 text-center space-y-6">
                <h1 className="text-4xl font-semibold tracking-wide">Sudoku</h1>

                <button
                    onClick={signInAnonymously}
                    className="w-full py-3 rounded-xl font-medium tracking-wide bg-cyan-500/90 hover:bg-cyan-400 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300"
                >
                    Play now
                </button>

                <p className="text-xs text-slate-400">
                    Play with your friends online. No sign up required.
                </p>
            </section>
        </main>
    );
}