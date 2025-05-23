"use server";

import { redirect } from "next/navigation";

/**
 * The user is redirected to “/”.
 */
export async function leaveGameAction(): Promise<void> {
    redirect("/");
}