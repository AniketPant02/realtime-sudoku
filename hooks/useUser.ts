"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import type { User } from "@supabase/supabase-js";

export default function useUser() {
    const [user, setUser] = useState<User | null>(null);
    const supabase = createClient();

    useEffect(() => {
        // fetch the current user on mount
        supabase.auth.getUser().then(({ data, error }) => {
            if (error) {
                console.error("Error fetching user (useUser.ts hook):", error);
            } else {
                setUser(data.user);
            }
        });
    }, [supabase]);

    return user;
}