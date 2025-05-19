"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";

/**
 * Remove the current user from the game’s player list.
 * If they were the last player, the game row is also deleted.
 * Finally, the user is redirected to “/”.
 */
export async function leaveGameAction(gameId: string): Promise<void> {
    const supabase = await createClient();
    const { data: { user }, error: authErr } = await supabase.auth.getUser();
    if (authErr || !user) redirect("/login");

    // remove the row in game_players
    const { error: leaveErr } = await supabase
        .from("game_players")
        .delete()
        .match({ user_id: user.id, game_id: gameId });

    if (leaveErr) throw leaveErr;

    // check how many players remain
    const { count, error: countErr } = await supabase
        .from("game_players")
        .select("*", { head: true, count: "exact" })
        .eq("game_id", gameId);

    if (countErr) throw countErr;

    // delete the game row if nobody’s left
    if (count === 0) {
        const { error: deleteErr } = await supabase
            .from("games")
            .delete()
            .match({ id: gameId });

        if (deleteErr) throw deleteErr;
    }

    // send the user back to the home page
    redirect("/");
}

/**
 * Update a game from “lobby” → “active”.
 */
export async function startGameAction(gameId: string): Promise<void> {
    const supabase = await createClient();

    const { error } = await supabase
        .from("games")
        .update({
            status: "active",
            started_at: new Date().toISOString(),
        })
        .eq("id", gameId)
        .eq("status", "lobby");               // idempotency guard

    if (error) throw error;
}