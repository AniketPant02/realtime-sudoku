"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { LogOut } from 'lucide-react';
import useUser from '@/hooks/useUser';
import { useGames } from '@/hooks/useGames';

export default function Home(): React.ReactElement {
  const user = useUser();
  const [joinId, setJoinId] = useState<string>('');
  const games = useGames();
  const supabase = createClient();
  const router = useRouter();

  const hostGame = async () => {
    const { data: [game], error } = await supabase
      .from('games')
      .insert({ host_user_id: user!.id })
      .select('id');
    if (error) return console.error(error);
    await supabase
      .from('game_players')
      .insert({ game_id: game.id, user_id: user!.id });
    router.push(`/lobby/${game.id}`);
  };

  const joinGame = async (gameId?: string) => {
    // takes param gameId from textbox input or from game list
    const id = gameId || joinId;
    if (!id) return;
    await supabase
      .from('game_players')
      .insert({ game_id: id, user_id: user!.id });
    router.push(`/lobby/${id}`);
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
    <div className="min-h-screen flex flex-col items-center p-6 align-center justify-center">
      <div className="w-full max-w-md rounded-2xl shadow-md p-6 space-y-6">
        <p className="text-lg">
          Logged in as <span className="font-semibold">{user?.user_metadata?.username}</span>
        </p>
        <button
          className="w-full py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
          onClick={hostGame}
        >
          Host New Game
        </button>
        <div className="flex space-x-3">
          <input
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none"
            placeholder="Game ID to join"
            value={joinId}
            onChange={e => setJoinId(e.target.value)}
          />
          <button
            className="px-4 py-2 bg-green-500 text-white rounded-lg disabled:opacity-50 transition"
            onClick={() => joinGame()}
            disabled={!joinId}
          >
            Join Game
          </button>
        </div>
        <div className="pt-4 border-t border-gray-200 space-y-3">
          <h2 className="text-lg font-medium">Open Lobbies</h2>
          <ul className="space-y-2">
            {games.length > 0 ? (
              games.map(game => (
                <li
                  key={game.id}
                  className="flex justify-between items-center bg-slate-900 p-3 rounded-lg hover:bg-slate-800 transition"
                >
                  <span>Game {game.id} (hosted by {game.host})</span>
                  <button
                    className="text-blue-500 hover:underline"
                    onClick={() => joinGame(game.id)}
                  >
                    Join
                  </button>
                </li>
              ))
            ) : (
              <li className="text-gray-500">No active games</li>
            )}
          </ul>
        </div>
        <button
          className="w-full mt-4 flex items-center justify-center py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
          onClick={handleSignOut}
        >
          <LogOut className="mr-2" /> Logout
        </button>
      </div>
    </div>
  );
}