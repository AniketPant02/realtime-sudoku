import { useEffect, useRef, useState } from "react";
import { RealtimeChannel } from "@supabase/supabase-js";
import { createClient } from "@/utils/supabase/client";
import { parsePuzzle, boardToString, isValidMove, Cell } from "@/utils/sudoku";
import debounce from "lodash.debounce";

export default function useSudokuSync(
    gameId: string,
    rawPuzzle: string,
    isHost: boolean,
) {
    const supabase = createClient();
    const [board, setBoard] = useState<Cell[][]>(parsePuzzle(rawPuzzle));
    const channelRef = useRef<RealtimeChannel | null>(null);

    // attach broadcast channel
    useEffect(() => {
        if (!gameId) return;
        const channel = supabase.channel(`sudoku::${gameId}`, {
            config: { broadcast: { self: false } },
        });
        channel.on("broadcast", { event: "cell-update" }, ({ payload }) => {
            setBoard(b => {
                const next = b.map(row => row.map(c => ({ ...c })));
                next[payload.r][payload.c].v = payload.v;
                return next;
            });
        });
        channel.subscribe();
        channelRef.current = channel;
        return () => void supabase.removeChannel(channel);
    }, [gameId]);

    // send changes
    const setCell = (r: number, c: number, v: string) =>
        setBoard(prev => {
            if (prev[r][c].fixed || !isValidMove(prev, r, c, v)) return prev;
            const next = prev.map(row => row.map(c => ({ ...c })));
            next[r][c].v = v;
            channelRef.current?.send({
                type: "broadcast",
                event: "cell-update",
                payload: { r, c, v },
            });
            return next;
        });

    // host saves changes to DB
    const debouncedSave = useRef(
        debounce(async (latest: Cell[][]) => {
            const str = boardToString(latest);
            const { error } = await supabase
                .from("games")
                .update({ puzzle: str, updated_at: new Date() })
                .eq("id", gameId)
                .select()
                .single(); // we don't need me.id check here, as this is only called by the host
            if (error) console.error("DB save failed:", error);
        }, 400),
    ).current;

    useEffect(() => {
        if (isHost) debouncedSave(board);
    }, [board, isHost, debouncedSave]);

    return { board, setCell };
}