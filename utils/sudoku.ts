// some utility functions for sudoku

export type Cell = { v: string; fixed: boolean };

export function parsePuzzle(str: string): Cell[][] {
    // parse a sudoku puzzle string into a 2D array of cells
    // str is a 81 character string with digits 1-9 and '-' for empty cells
    return [...Array(9)].map((_, r) =>
        [...Array(9)].map((__, c) => {
            const ch = str[r * 9 + c];
            return { v: ch === "-" ? "" : ch, fixed: ch !== "-" };
        }),
    );
}

export function boardToString(board: Cell[][]): string {
    return board.flat().map(c => (c.v === "" ? "-" : c.v)).join("");
}

export function isValidMove(board: Cell[][], r: number, c: number, v: string) {
    if (!v) return true; // clearing is always fine
    // row / col
    for (let i = 0; i < 9; i++)
        if ((i !== c && board[r][i].v === v) || (i !== r && board[i][c].v === v))
            return false;
    // box
    const R = Math.floor(r / 3) * 3,
        C = Math.floor(c / 3) * 3;
    for (let i = R; i < R + 3; i++)
        for (let j = C; j < C + 3; j++)
            if ((i !== r || j !== c) && board[i][j].v === v) return false;
    return true;
}

export function isSolved(board: Cell[][]) {
    return board.every(row => row.every(c => c.v !== "")) &&
        [...Array(9)].every((_, i) => isValidMove(board, Math.floor(i / 9), i % 9, board[Math.floor(i / 9)][i % 9].v));
}