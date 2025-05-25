import { useEffect, useRef, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { parsePuzzle, boardToString, isValidMove, Cell } from "@/utils/sudoku";
import { RealtimeChannel } from "@supabase/supabase-js";
import useUser from "./useUser";

export default function useSudokuSync(
    gameId: string,
    rawPuzzle: string,
) {
    const me = useUser();
    const supabase = createClient();
    const [board, setBoard] = useState<Cell[][]>(() =>
        parsePuzzle(rawPuzzle)
    );
    const channelRef = useRef<RealtimeChannel | null>(null);

    // helper to apply a single move
    function applyMove(
        b: Cell[][],
        { r, c, v }: { r: number; c: number; v: string }
    ) {
        const next = b.map(row => row.map(cell => ({ ...cell })));
        if (!next[r][c].fixed) {
            next[r][c].v = v;
        }
        return next;
    }

    useEffect(() => {
        if (!gameId) return;

        supabase
            .from("game_moves")
            .select("r, c, v")
            .eq("game_id", gameId)
            .order("created_at", { ascending: true })
            .then(({ data, error }) => {
                if (error) return console.error(error);
                setBoard(b =>
                    data!.reduce(
                        (b, move) => applyMove(b, { r: move.r, c: move.c, v: move.v ?? "" }),
                        b
                    )
                );
            });

        const channel = supabase
            .channel("realtime_moves")
            .on(
                "postgres_changes",
                {
                    event: "INSERT",
                    schema: "public",
                    table: "game_moves",
                    filter: `game_id=eq.${gameId}`,
                },
                ({ new: move }) => {
                    const { r, c, v } = move;
                    setBoard(b =>
                        applyMove(b, { r: r, c: c, v: v ?? "" })
                    );
                }
            )
            .subscribe();

        channelRef.current = channel;
        return () => {
            if (channelRef.current) supabase.removeChannel(channelRef.current);
        };
    }, [gameId]);

    const setCell = (r: number, c: number, v: string) => {
        setBoard(prev => {
            if (prev[r][c].fixed) return prev;
            const next = prev.map(row => row.map(cell => ({ ...cell })));
            next[r][c].v = v;   // v might be '' now
            // persist this single move (digit or blank)
            supabase
                .from("game_moves")
                .insert({
                    game_id: gameId,
                    user_id: me?.id,
                    r,
                    c,
                    v: v === '' ? null : v,  // or just v === '' if you prefer empty-string
                })
                .then(({ error }) => {
                    if (error) console.error("insert move failed:", error);
                });
            return next;
        });
    };

    return { board, setCell };
}