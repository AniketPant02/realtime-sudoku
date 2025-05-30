// This hook gets and subscribes to the list of active games in lobby status.
"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";

export type Game = {
    id: string;
    host: string;
    updated_at: string;
    difficulty: string;
};

export function useGames() {
    const [games, setGames] = useState<Game[]>([]);
    const supabase = createClient();

    useEffect(() => {
        // load existing in-progress games
        const loadActive = async () => {
            const { data, error } = await supabase
                .from("games")
                .select("id, host_user_id, updated_at, difficulty")
                .eq("status", "in_progress")
                .order("updated_at", { ascending: false });

            if (error) {
                console.error("Error fetching active games (/hooks/useGames.ts):", error);
                return;
            }

            setGames(
                data.map((g) => ({
                    id: g.id,
                    host: g.host_user_id,
                    updated_at: g.updated_at,
                    difficulty: g.difficulty,
                }))
            );
        };

        loadActive(); // initial fetch

        // subscribe to lobby changes
        const subscription = supabase
            .channel("public:games")
            .on(
                "postgres_changes",
                { event: "INSERT", schema: "public", table: "games", filter: "status=eq.in_progress" },
                (payload) => {
                    setGames((current) => [
                        ...current,
                        { id: payload.new.id, host: payload.new.host_user_id, updated_at: payload.new.updated_at, difficulty: payload.new.difficulty },
                    ]);
                }
            )
            .on(
                "postgres_changes",
                { event: "UPDATE", schema: "public", table: "games", filter: "status=eq.in_progress" },
                (payload) => {
                    if (payload.new.status !== "in_progress") {
                        setGames((current) => current.filter((g) => g.id !== payload.new.id));
                    }
                }
            )
            .on(
                "postgres_changes",
                { event: "DELETE", schema: "public", table: "games", filter: "status=eq.in_progress" },
                (payload) => {
                    setGames((cur) => cur.filter((g) => g.id !== payload.old.id));
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(subscription);
        };
    }, [supabase]);

    return games;
}