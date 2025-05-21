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

        const ch = supabase.channel(`presence-room-${room}`);
        channelRef.current = ch;

        ch.on("broadcast", { event: "mousemove" }, ({ payload }) => {
            const { position, user, color } = payload as any;
            setCursors((prev) => ({
                ...prev,
                [user.id]: { ...position, username: user.username, color },
            }));
        });

        const handleMouseMove = (e: MouseEvent) => {
            if (!channelRef.current) return;
            channelRef.current.send({
                type: "broadcast",
                event: "mousemove",
                payload: {
                    position: { x: e.clientX, y: e.clientY },
                    user: { id: me.id, username: me.user_metadata.username },
                    color: myColor.current,
                },
            });
        };

        ch.subscribe((status) => {
            if (status === "SUBSCRIBED") {
                window.addEventListener("mousemove", handleMouseMove);
            }
        });

        return () => {
            window.removeEventListener("mousemove", handleMouseMove);
            supabase.removeChannel(ch);
        };
    }, [room, me, supabase]);

    return cursors;
}