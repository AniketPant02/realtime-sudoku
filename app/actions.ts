"use server";
import { createClient } from "@/utils/supabase/server";
import { getSudoku } from 'sudoku-gen';

export async function hostGameAction(userId: string, difficulty: "easy" | "medium" | "hard") {
    const supabase = await createClient();
    const puzzle = getSudoku(difficulty);
    const { data, error } = await supabase
        .from("games")
        .insert({
            host_user_id: userId,
            status: "in_progress",
            difficulty: puzzle.difficulty,
            puzzle: puzzle.puzzle,
            solution: puzzle.solution,
        })
        .select("id");
    if (error) throw error;
    return data?.[0]?.id;
}