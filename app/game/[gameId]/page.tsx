"use client";

import React, { startTransition, useEffect, useState, useRef } from "react";
import { createClient } from '@/utils/supabase/client'
import { useParams } from "next/navigation";
import { MousePointer2 } from "lucide-react";

import { leaveGameAction } from "./actions";
import useUser from "@/hooks/useUser";
import usePlayers, { usePlayerCursors } from "@/hooks/usePlayers";
import { RealtimeChannel } from "@supabase/supabase-js";

import SudokuBoard from "@/components/SudokuBoard";
import { isSolved } from "@/utils/sudoku";
import useSudokuSync from "@/hooks/useSudokuSync";

// matches Supabase schema in games table
type Game = {
    id: string;
    host_user_id: string;
    status: string;
    created_at: string;
    difficulty: string;
    puzzle: string;
    solution: string;
    updated_at: string;
};

function Sudoku({ runtimePuzzle, isHost }: { runtimePuzzle: string; isHost: boolean }) {
    const { gameId } = useParams();
    const supabase = createClient();
    const { board, setCell } = useSudokuSync(gameId as string, runtimePuzzle);

    useEffect(() => {
        if (isSolved(board) && isHost) {
            supabase
                .from("games")
                .update({ status: "finished" })
                .eq("id", gameId);
        }
    }, [board, isHost, gameId, supabase]);

    return (
        <>
            <SudokuBoard board={board} setCell={setCell} />
        </>
    );
}


export default function Game() {
    const { gameId: rawGameId } = useParams();
    const gameId = rawGameId as string;
    const supabase = createClient();

    const [game, setGame] = useState<Game | null>(null);
    const [puzzle, setPuzzle] = useState("");
    const me = useUser(); // custom hook to get the current user
    const isHost = game?.host_user_id === me?.id; // check if the current user is the host

    const players = usePlayers(`room-${gameId}`); // custom hook to track players in the game
    const cursors = usePlayerCursors(`presence::room-${gameId}`); // custom hook to track player cursors

    // fetch game + puzzle
    useEffect(() => {
        const fetchGame = async () => {
            if (!gameId) return;
            const { data, error } = await supabase
                .from("games")
                .select("*")
                .eq("id", gameId)
                .single();
            if (error) throw error;
            setGame(data);
            setPuzzle(data.puzzle);
        };
        fetchGame();
    }, [gameId, supabase]);

    useEffect(() => {
        console.log("Current players:", players);
    }, [players]);

    const channelRef = useRef<RealtimeChannel | null>(null);

    useEffect(() => {
        if (!me || !gameId) return;

        const channel = supabase.channel(`broadcast::room-${gameId}`, {
            config: {
                presence: { key: me.id },
                broadcast: { self: true },
            }
        });
        channelRef.current = channel;

        channel.on("broadcast", { event: "button-click" }, ({ payload }) => {
            console.log("Button clicked by:", payload);
        });

        channel.subscribe();

        return () => void supabase.removeChannel(channel);
    }, [gameId, me, supabase]);

    const leaveGame = () => {
        if (!gameId) return;
        startTransition(() => leaveGameAction());
    };

    return (
        <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 text-slate-100">
            {Object.entries(cursors).map(([id, cur]) => (
                <div
                    key={id}
                    className="fixed z-50 pointer-events-none"
                    style={{
                        left: cur.x * window.innerWidth,
                        top: cur.y * window.innerHeight,
                        transition: "transform 0.1s ease-in-out",
                        transform: "translate(0, 0)",
                        color: cur.color,
                    }}
                >
                    <MousePointer2 size={16} />
                    <span className="ml-1 rounded bg-black/40 px-1 text-xs font-semibold text-white drop-shadow-md">
                        {cur.username}
                    </span>
                </div>
            ))}
            <section className="w-[min(100%_,26rem)] mx-4 rounded-3xl bg-slate-900/60 backdrop-blur p-6 shadow-2xl ring-1 ring-slate-700/40">
                {/* header */}
                <header className="flex items-center justify-between mb-4">
                    <h1 className="text-2xl font-semibold tracking-wide">Sudoku</h1>
                    <button
                        onClick={leaveGame}
                        className="text-rose-400 hover:text-rose-300 transition-colors"
                    >
                        Leave
                    </button>
                </header>

                {/* meta */}
                <div className="flex justify-between text-xs text-slate-400 mb-4">
                    <span>User&nbsp;•&nbsp;{me?.user_metadata.username}</span>
                    <span>ID&nbsp;•&nbsp;{gameId}</span>
                </div>

                {/* board */}
                <div className="flex justify-center">
                    {puzzle ? (
                        <Sudoku runtimePuzzle={puzzle} isHost={isHost} />
                    ) : (
                        <p className="animate-pulse text-slate-500">Loading…</p>
                    )}
                </div>
            </section>
        </main>
    );
}