"use client";

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import type { User } from '@supabase/supabase-js';

type Player = { user_id: string; joined_at: string };

export default function Lobby(): React.ReactElement {
    const { gameId } = useParams(); // gameId is a string from URL
    const supabase = createClient();
    const [players, setPlayers] = useState<Player[]>([]);
    const [me, setMe] = useState<User | null>(null);

    useEffect(() => {
        // we can turn this into a custom hook
        supabase.auth.getUser().then(({ data }) => setMe(data.user));
    }, [supabase]);

    // fetch initial list
    useEffect(() => {
        supabase
            .from('game_players')
            .select('user_id, joined_at')
            .eq('game_id', gameId)
            .then(({ data, error }) => {
                if (error) console.error(error);
                else setPlayers(data || []);
            });

        // subscribe to new players using realtime channel
        const subscription = supabase.channel('game_players_channel')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'game_players',
                    filter: `game_id=eq.${gameId}`,
                },
                (payload) => {
                    setPlayers(prev => [...prev, payload.new as Player]);
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(subscription);
        };
    }, [supabase, gameId]);

    return (
        <div className="p-4">
            <h1>Lobby: {gameId}</h1>
            <ul>
                {players.map(p => (
                    <li key={p.user_id}>
                        {p.user_id === me?.id ? 'You' : p.user_id}
                    </li>
                ))}
            </ul>
            {/* Next: host can start game, everyone sees grid appear, etc. */}
        </div>
    );
}