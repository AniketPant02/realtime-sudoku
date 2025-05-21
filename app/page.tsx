"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { LogOut } from 'lucide-react';
import useUser from '@/hooks/useUser';
import { useGames } from '@/hooks/useGames';

import HostGameButton from '@/components/HostGameButton';
import { hostGameAction } from "./actions";
import { type Difficulty } from '@/components/HostGameButton';

export default function Home(): React.ReactElement {
  const me = useUser();
  const [joinId, setJoinId] = useState<string>('');
  const games = useGames();
  const supabase = createClient();
  const router = useRouter();

  const hostGame = async (level: Difficulty = "easy") => {
    if (!me) return;

    try {
      // pass the difficulty to your server action
      console.log('Hosting game with difficulty:', level);
      const gameId = await hostGameAction(me.id, level);
      if (gameId) router.push(`/game/${gameId}`);
    } catch (err) {
      console.error(err);
    }
  };

  const joinGame = async (gameId?: string) => {
    // takes param gameId from textbox input or from game list
    const id = gameId || joinId;
    if (!id) return;
    router.push(`/game/${id}`);
  };

  const handleSignOut = async (): Promise<void> => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Sign out error:', error);
    } else {
      router.push('/login');
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 text-slate-100 p-6">
      <section className="w-[min(100%_,28rem)] mx-4 rounded-3xl bg-slate-900/60 backdrop-blur p-8 shadow-2xl ring-1 ring-slate-700/40 space-y-6">
        {/* header */}
        <header className="flex items-center justify-between">
          <p className="truncate">
            Logged in as&nbsp;
            <span className="font-semibold">{me?.user_metadata.username}</span>
          </p>

          <button
            onClick={handleSignOut}
            className="flex items-center gap-1 text-sm text-rose-400 hover:text-rose-300 transition-colors"
          >
            <LogOut size={16} /> Logout
          </button>
        </header>

        {/* host button */}
        {/* <button
          onClick={hostGame}
          className="w-full py-3 rounded-xl font-medium bg-cyan-500/90 hover:bg-cyan-400 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300"
        >
          Host new game
        </button> */}
        <HostGameButton onHost={hostGame} />

        {/* join by ID */}
        <div className="flex gap-3">
          <input
            className="flex-1 rounded-xl bg-slate-800/60 px-4 py-2 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-400"
            placeholder="Game ID to join"
            value={joinId}
            onChange={e => setJoinId(e.target.value)}
          />
          <button
            onClick={() => joinGame()}
            disabled={!joinId}
            className="px-4 py-2 rounded-xl font-medium bg-emerald-500/90 hover:bg-emerald-400 disabled:opacity-40 transition-colors"
          >
            Join
          </button>
        </div>

        {/* open lobbies */}
        <div className="pt-5 border-t border-slate-700/60 space-y-3">
          <h2 className="text-lg font-medium">Open lobbies</h2>

          {games.length ? (
            <ul className="space-y-2 max-h-56 overflow-y-auto">
              {games.map(g => (
                <li
                  key={g.id}
                  className="flex justify-between items-center rounded-xl bg-slate-800/60 px-4 py-3 hover:bg-slate-800/80 transition-colors"
                >
                  <span className="truncate">
                    {g.id.slice(0, 8)}&nbsp;• host&nbsp;{g.host}
                  </span>
                  <button
                    onClick={() => joinGame(g.id)}
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
      </section>
    </main>
  );
}