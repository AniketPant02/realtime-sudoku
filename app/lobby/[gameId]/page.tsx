"use client";

import React, { useEffect, useRef, useCallback, useState, useTransition } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import useUser from "@/hooks/useUser";
import usePlayerList from "@/hooks/useGameState";
import { leaveGameAction, startGameAction } from "./actions";

type ReadyMap = Record<string, boolean>;

export default function Lobby() {
    const { gameId: rawGameId } = useParams();
    const gameId = rawGameId as string;
    const router = useRouter();
    const supabase = createClient();

    const me = useUser();
    const players = usePlayerList({ gameId });
    const [isPending, startTransition] = useTransition();

    /* ---------------- presence ---------------- */
    const [ready, setReady] = useState<ReadyMap>({});
    const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

    useEffect(() => {
        if (!me) return;

        const channel = supabase.channel(`lobby:${gameId}`, {
            config: { presence: { key: me.id } },
        });

        const presenceToMap = (): ReadyMap => {
            const state = channel.presenceState() as Record<
                string,
                Array<{ ready: boolean }>
            >;
            const out: ReadyMap = {};
            for (const [uid, metas] of Object.entries(state)) {
                // any open tab says ready
                out[uid] = metas.some((m) => m.ready);
            }
            return out;
        };

        channel.on("presence", { event: "sync" }, () => setReady(presenceToMap()));

        channel.subscribe(async (status) => {
            if (status === "SUBSCRIBED") {
                await channel.track({ ready: false });
            }
        });

        channelRef.current = channel;
        return () => void channel.unsubscribe();
    }, [gameId, me, supabase]);

    // ---- auto-start effect ----
    const hasStartedRef = useRef(false);

    useEffect(() => {
        if (
            !hasStartedRef.current &&                // only run once
            players.length === 2 &&                  // exactly two players
            players.every((p) => ready[p.user_id])   // everyone ready
        ) {
            hasStartedRef.current = true;            // lock
            startGameAction(gameId)              // server action below
                .then(() => router.push(`/game/${gameId}`))
                .catch((err) => {
                    console.error("start game failed", err);
                    hasStartedRef.current = false;       // allow retry if desired
                });
        }
    }, [players, ready, gameId, router]);


    const isMeReady = me ? ready[me.id] ?? false : false;
    const toggleReady = async () => {
        if (!channelRef.current) return;
        await channelRef.current.track({ ready: !isMeReady });
    };

    const copyId = () => navigator.clipboard.writeText(gameId as string);

    const leaveGame = () => {
        if (!gameId) return;
        startTransition(() => {
            leaveGameAction(gameId);
        });
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <div className="w-full max-w-md rounded-2xl shadow-lg p-6 space-y-6">
                {/* header */}
                <div className="flex justify-between items-center">
                    <h1 className="text-2xl font-bold">Lobby</h1>
                    <button onClick={copyId} className="text-sm text-blue-500 hover:underline">
                        Copy ID
                    </button>
                </div>
                <p className="text-gray-600 truncate">{gameId}</p>

                {/* players */}
                <div>
                    <h2 className="text-lg font-medium mb-2">Players</h2>
                    <ul className="space-y-2">
                        {players.map((p) => (
                            <li key={p.user_id} className="flex items-center p-3 rounded-lg">
                                <span className="flex-1">
                                    {p.user_id === me?.id ? "You" : p.user_id}
                                </span>
                                {ready[p.user_id] && (
                                    <span className="text-green-600 text-xs font-semibold">READY ✓</span>
                                )}
                            </li>
                        ))}
                        {players.length === 0 && (
                            <li className="text-gray-500">No one here yet…</li>
                        )}
                    </ul>
                </div>

                {/* user actions */}
                <div className="flex gap-2 pt-4">
                    <button
                        onClick={toggleReady}
                        className={`flex-1 py-2 rounded-lg text-white transition ${isMeReady
                            ? "bg-gray-500 hover:bg-gray-600"
                            : "bg-green-500 hover:bg-green-600"
                            }`}
                    >
                        {isMeReady ? "Unready" : "Ready"}
                    </button>
                    <button
                        onClick={leaveGame}
                        className="flex-1 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
                    >
                        Leave Game
                    </button>
                </div>
            </div>
        </div>
    );
}