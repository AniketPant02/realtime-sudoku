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

import OpenLobbies from "@/components/OpenLobbies";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default function Home(): React.ReactElement {
  const me = useUser();
  const [joinId, setJoinId] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const games = useGames();
  const supabase = createClient();
  const router = useRouter();

  const hostGame = async (level: Difficulty = "easy") => {
    if (!me) return;

    try {
      const gameId = await hostGameAction(me.id, level);
      if (gameId) router.push(`/game/${gameId}`);
    } catch (err) {
      console.error(err);
    }
  };

  const joinGame = async (gameId?: string) => {
    const id = gameId || joinId.trim();
    setError(null);

    if (!UUID_RE.test(id)) {
      setError("Game not found");
      return;
    }
    const { data, error } = await supabase
      .from("games")
      .select("id")
      .eq("id", id)
      .single();

    if (error || !data) {
      setError("Game not found");
      return;
    }

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
        <HostGameButton onHost={hostGame} />
        <div className="flex gap-3">
          <input
            className="flex-1 rounded-xl bg-slate-800/60 px-4 py-2 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-400"
            placeholder="Game ID to join"
            value={joinId}
            onChange={e => {
              if (e.target.value === "") {
                setError(null)
              }
              setJoinId(e.target.value)
            }}
          />
          <button
            onClick={() => joinGame()}
            disabled={!joinId}
            className="px-4 py-2 rounded-xl font-medium bg-emerald-500/90 hover:bg-emerald-400 disabled:opacity-40 transition-colors"
          >
            Join
          </button>
          {error && (
            <p className="text-sm text-rose-400 mt-1">{error}</p>
          )}
        </div>
        <div className="pt-5 border-slate-700/60 space-y-3">
          <OpenLobbies games={games} onJoin={joinGame} />
        </div>
      </section>
    </main>
  );
}