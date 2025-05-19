"use client";

import React from 'react';
import { signInAnonymously } from './actions';

export default function LoginPage() {
    return (
        <main className="min-h-screen flex items-center justify-center p-6">
            <div className="w-full max-w-md rounded-2xl shadow-md p-6 space-y-6 text-center">
                <h1 className="text-3xl font-semibold">OurSudoku</h1>
                <button
                    onClick={signInAnonymously}
                    className="w-full py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
                >
                    Play now
                </button>
            </div>
        </main>
    );
}