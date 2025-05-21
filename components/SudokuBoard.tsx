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
        <div className="grid grid-cols-9 gap-0.5 bg-gray-600 p-1 rounded">
            {board.map((row, r) =>
                row.map((cell, c) => {
                    const bad = cell.v && !isValidMove(board, r, c, cell.v);
                    return (
                        <input
                            key={`${r}-${c}`}
                            value={cell.v}
                            disabled={cell.fixed}
                            onChange={e => {
                                const v = e.target.value.slice(-1); // last typed char
                                if (/^[1-9]?$/.test(v)) setCell(r, c, v);
                            }}
                            className={`w-9 h-9 text-center text-lg ${cell.fixed ? "bg-gray-700 text-white" : "bg-gray-800 text-emerald-300"
                                } ${bad ? "border border-red-500" : ""}`}
                        />
                    );
                }),
            )}
        </div>
    );
}