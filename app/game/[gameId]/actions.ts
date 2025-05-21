"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";

/**
 * Remove the current user from the game’s player list.
 * If they were the last player, the game row is also deleted.
 * Finally, the user is redirected to “/”.
 * This function is identical to the one in app/lobby/gameId/actions.ts.
 */
export async function leaveGameAction(gameId: string): Promise<void> {
    redirect("/");
}