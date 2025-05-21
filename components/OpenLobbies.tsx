"use client";

import React from "react";

type Lobby = {
  id: string;
  host: string;
};

export interface OpenLobbiesProps {
  games: Lobby[];               // array of active games
  onJoin: (id: string) => void; // callback
}

export default function OpenLobbies({ games, onJoin }: OpenLobbiesProps): React.ReactElement {
  return (
    <div className="pt-5 border-t border-slate-700/60 space-y-3">
      <h2 className="text-lg font-medium">Open lobbies</h2>

      {games.length ? (
        <ul className="space-y-2 max-h-56 overflow-y-auto">
          {games.map((g) => (
            <li
              key={g.id}
              className="flex justify-between items-center rounded-xl bg-slate-800/60 px-4 py-3 hover:bg-slate-800/80 transition-colors"
            >
              <span className="truncate">
                {g.id.slice(0, 8)}&nbsp;• host&nbsp;{g.host}
              </span>
              <button
                onClick={() => onJoin(g.id)}
                className="text-cyan-400 hover:underline"
              >
                Join
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-slate-500">No active games</p>
      )}
    </div>
  );
}