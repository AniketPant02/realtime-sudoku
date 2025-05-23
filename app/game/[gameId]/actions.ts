"use server";

import { redirect } from "next/navigation";

/**
 * The user is redirected to “/”.
 */
export async function leaveGameAction(gameId: string): Promise<void> {
    redirect("/");
}