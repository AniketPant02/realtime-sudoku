"use client";

import React from 'react';
import { signInWithGitHub } from './actions';

export default function LoginPage() {
    return (
        <main className="flex flex-col items-center justify-center min-h-screen bg-black text-white">
            <h1 className="mb-6 text-3xl font-semibold">Login</h1>
            <button
                onClick={signInWithGitHub}
                className="px-6 py-2 font-medium text-white bg-gray-900 rounded hover:bg-gray-800 transition-colors"
            >
                Log in with GitHub
            </button>
        </main>
    );
}