// this file handles getting game state and player state (e.g. connected players in a lobby)
"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";

type Player = { user_id: string; joined_at: string };

export default function usePlayerList({ gameId }: { gameId: string }) {
    const [players, setPlayers] = useState<Player[]>([]);
    const supabase = createClient();

    useEffect(() => {
        const load = async () => {
            const { data, error } = await supabase
                .from('game_players')
                .select('user_id, joined_at')
                .eq('game_id', gameId);
            if (error) console.error(error);
            else setPlayers(data || []);
        };
        load();

        const sub = supabase
            .channel(`lobby-${gameId}`)
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'game_players',
                filter: `game_id=eq.${gameId}`,
            }, payload => {
                setPlayers(ps => [...ps, payload.new as Player]);
            })
            .on("postgres_changes", {
                event: "DELETE",
                schema: "public",
                table: "game_players",
                filter: `game_id=eq.${gameId}`
            }, (payload) => {
                setPlayers((cur) => cur.filter((g) => g.user_id !== payload.old.user_id));
            })
            .subscribe();

        return () => {
            supabase.removeChannel(sub);
        };
    }, [supabase, gameId]);

    return players;
}