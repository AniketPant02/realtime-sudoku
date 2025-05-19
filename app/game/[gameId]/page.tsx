"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

export default function Game() {
    const { gameId: rawGameId } = useParams();
    const gameId = rawGameId as string;
    const router = useRouter();
    const supabase = createClient();

    return (
        <div>Game: {gameId}</div>
    )
}