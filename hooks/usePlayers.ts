"use client";

import { useState, useEffect, useRef } from "react";
import { createClient } from "@/utils/supabase/client";
import useUser from "@/hooks/useUser";
import type { RealtimeChannel } from "@supabase/supabase-js";

type PresenceUser = { id: string; username: string };

export default function usePlayers(room: string) {
    const me = useUser();
    const supabase = createClient();
    const [users, setUsers] = useState<PresenceUser[]>([]);

    // join realtime channel for sharing user presence
    useEffect(() => {
        if (!me || !room) return;

        // Create presence-enabled channel; use the user’s UUID as the presence key
        const channel = supabase.channel(`${room}`, {
            config: { presence: { key: me.id } },
        });

        // Helper to flatten the presence state object into an array
        const parseState = () => {
            const state = channel.presenceState();          // { [key]: [{…state}] }
            const flat = Object.values(state)
                .flat()                                       // take first slice for each key
                .map((p: any) => ({ id: p.id, username: p.username }));
            setUsers(flat);
        };

        channel
            .on("presence", { event: "sync" }, parseState)
            .on("presence", { event: "join" }, ({ key, newPresences }) =>
                console.log("join:", key, newPresences)
            )
            .on("presence", { event: "leave" }, ({ key, leftPresences }) =>
                console.log("leave:", key, leftPresences)
            )
            .subscribe(async (status) => {
                if (status !== "SUBSCRIBED") return;
                await channel.track({
                    id: me.id,
                    username: me.user_metadata.username ?? "Anonymous",
                });
            });

        return () => {
            channel.untrack();
            supabase.removeChannel(channel);
        };
    }, [room, me, supabase]);

    return users;
}

type Cursor = {
    x: number;
    y: number;
    username: string;
    color: string;
};

// TODO: move to supabase anon login metadata function so this color can be access everywhere via useUser
const generateRandomColor = () => {
    return `hsl(${Math.floor(Math.random() * 360)}, 100%, 70%)`;
}

export function usePlayerCursors(room: string | null) {
    const supabase = createClient();
    const me = useUser();

    const [cursors, setCursors] = useState<Record<string, Cursor>>({});
    const channelRef = useRef<RealtimeChannel | null>(null);
    const myColor = useRef(generateRandomColor());

    useEffect(() => {
        if (!me || !room) return;

        // ① turn this into a presence channel
        const ch = supabase.channel(`presence-room-${room}`, {
            config: { presence: { key: me.id } },
        });

        channelRef.current = ch;

        // ② when someone moves, update their cursor
        ch.on("broadcast", { event: "mousemove" }, ({ payload }) => {
            const { position, user, color } = payload as any;
            setCursors(prev => ({
                ...prev,
                [user.id]: { ...position, username: user.username, color },
            }));
        });

        // ③ whenever presence sync/join/leave happens, prune cursors
        const prune = () => {
            const state = ch.presenceState();          // { [id]: [...] }
            const active = new Set(Object.keys(state));
            setCursors(prev => {
                const next: typeof prev = {};
                for (let id of active) {
                    if (prev[id]) next[id] = prev[id];
                }
                return next;
            });
        };

        ch
            .on("presence", { event: "sync" }, prune)
            .on("presence", { event: "join" }, prune)
            .on("presence", { event: "leave" }, prune)
            .subscribe(status => {
                if (status === "SUBSCRIBED") {
                    ch.track({ id: me.id, username: me.user_metadata.username });
                    window.addEventListener("mousemove", broadcastMouse);
                }
            });

        function broadcastMouse(e: MouseEvent) {
            ch.send({
                type: "broadcast",
                event: "mousemove",
                payload: {
                    position: { x: e.clientX / window.innerWidth, y: e.clientY / window.innerHeight },
                    user: { id: me?.id, username: me?.user_metadata.username },
                    color: myColor.current,
                },
            });
        }

        return () => {
            window.removeEventListener("mousemove", broadcastMouse);
            ch.untrack();
            void supabase.removeChannel(ch);
        };
    }, [room, me, supabase]);

    return cursors;
}