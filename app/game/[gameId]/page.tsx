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

function Sudoku({ runtimePuzzle, isHost }: { runtimePuzzle: string; isHost: boolean }) {
    const { gameId } = useParams();
    const supabase = createClient();
    const me = useUser();
    const { board, setCell } = useSudokuSync(gameId as string, runtimePuzzle, isHost);

    useEffect(() => {
        if (isSolved(board) && isHost) {
            supabase
                .from("games")
                .update({ status: "finished" })
                .eq("id", gameId);
        }
    }, [board, isHost, gameId]);

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

    const [game, setGame] = useState<any>(null);
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
    }, [gameId]);

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

    const handlePing = () => {
        if (!channelRef.current || !me) return;
        channelRef.current.send({
            type: "broadcast",
            event: "button-click",
            payload: {
                id: me.id,
                username: me.user_metadata.username,
                at: Date.now(),
            },
        });
    };

    const leaveGame = () => {
        if (!gameId) return;
        startTransition(() => leaveGameAction(gameId));
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gray-900">
            {Object.entries(cursors).map(([id, cur]) => (
                <div
                    key={id}
                    className="absolute pointer-events-none"
                    style={{
                        left: cur.x,
                        top: cur.y,
                        translate: "-50% -50%",
                        color: cur.color,
                    }}
                >
                    <MousePointer2 size={16} />
                    <span className="text-xs text-white">{cur.username}</span>
                </div>
            ))}
            <div className="w-full max-w-md rounded-2xl shadow-lg p-6 space-y-6 bg-gray-800">
                <div className="flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-white">Sudoku Board</h1>
                    <button
                        onClick={leaveGame}
                        className="text-sm text-red-400 hover:underline"
                    >
                        Leave Game
                    </button>
                </div>
                <div className="flex justify-between items-center">
                    <p className="text-gray-400 truncate">User: {me?.user_metadata.username}</p>
                    <p className="text-gray-400 truncate">ID: {gameId}</p>
                </div>
                <div className="flex justify-center bg-gray-700 rounded-lg">
                    {puzzle ? (
                        <Sudoku
                            runtimePuzzle={puzzle}
                            isHost={isHost}
                        />
                    ) : (
                        <div className="text-lg font-semibold text-gray-400">Loading...</div>
                    )}
                </div>
            </div>
        </div>
    );
}