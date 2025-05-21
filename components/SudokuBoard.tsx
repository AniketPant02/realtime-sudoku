import React from "react";
import { Cell, isValidMove } from "@/utils/sudoku";

export default function SudokuBoard({
    board,
    setCell,
}: {
    board: Cell[][];
    setCell: (r: number, c: number, v: string) => void;
}) {
    return (
        <div className="grid grid-cols-9 grid-rows-9 gap-px rounded-lg
                  bg-slate-700 overflow-hidden shadow-lg
                  ring-1 ring-slate-700/60">

            {board.map((row, r) =>
                row.map((cell, c) => {
                    const bad = cell.v && !isValidMove(board, r, c, cell.v);

                    // ── style helpers ────────────────────────────────────────────────
                    const striped = (Math.floor(r / 3) + Math.floor(c / 3)) % 2 === 0;
                    const thickRight = (c + 1) % 3 === 0 && c !== 8;
                    const thickBottom = (r + 1) % 3 === 0 && r !== 8;

                    const className = [
                        /* base sizing & typography */
                        "w-9 h-9 md:w-11 md:h-11 text-center font-medium",
                        "text-lg md:text-xl caret-cyan-400 outline-none transition-colors",

                        /* alternating 3×3 shading */
                        striped ? "bg-slate-800" : "bg-slate-850",

                        /* fixed vs editable */
                        cell.fixed
                            ? "text-slate-200"
                            : "text-emerald-300 placeholder:text-slate-500",

                        /* focus ring only on editable cells */
                        !cell.fixed && "focus:ring-2 focus:ring-cyan-400",

                        /* invalid move ring */
                        bad && "ring-2 ring-rose-500",

                        /* thick sub-grid borders */
                        thickRight && "border-r-2 border-slate-600",
                        thickBottom && "border-b-2 border-slate-600",
                    ]
                        .filter(Boolean)          // remove false | undefined
                        .join(" ");               // → single class string

                    return (
                        <input
                            key={`${r}-${c}`}
                            value={cell.v}
                            disabled={cell.fixed}
                            maxLength={1}
                            onChange={e => {
                                const v = e.target.value.slice(-1);      // last typed char
                                if (/^[1-9]?$/.test(v)) setCell(r, c, v);
                            }}
                            className={className}
                        />
                    );
                })
            )}
        </div>
    );
}