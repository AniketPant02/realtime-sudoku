"use client"

import type React from "react"
import { useState } from "react"
import { Users, Clock, Trophy, ArrowRightCircle, Trash2 } from "lucide-react"
import { createClient } from "@/utils/supabase/client"
import useUser from "@/hooks/useUser";

type Lobby = {
  id: string
  host: string
  updated_at: string
  difficulty: string
}

export interface OpenLobbiesProps {
  games: Lobby[]
  onJoin: (id: string) => void
}

export interface LobbyItemProps {
  lobby: Lobby
  onJoin: (id: string) => void
}

function LobbyItem({ lobby, onJoin }: LobbyItemProps): React.ReactElement {
  const { id, host, updated_at, difficulty } = lobby

  const me = useUser() // user is the current user
  const supabase = createClient()
  const isHostUser = me?.id === host

  const [copied, setCopied] = useState(false);

  const copyId = () => {
    navigator.clipboard.writeText(id)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  const handleDelete = async () => {
    const { error } = await supabase
      .from("games")
      .delete()
      .eq("id", id)
    if (error) {
      console.error("Failed to delete game:", error)
    }
  }

  // Format the timestamp nicely
  const formattedDate = new Date(updated_at).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
  })

  // Difficulty variants
  const difficultyConfig = {
    easy: {
      color: "bg-gradient-to-r from-emerald-500 to-green-500",
      icon: <Trophy className="h-3.5 w-3.5 mr-1" />,
    },
    medium: {
      color: "bg-gradient-to-r from-amber-500 to-yellow-500",
      icon: <Trophy className="h-3.5 w-3.5 mr-1" />,
    },
    hard: {
      color: "bg-gradient-to-r from-rose-500 to-red-500",
      icon: <Trophy className="h-3.5 w-3.5 mr-1" />,
    },
  }[difficulty.toLowerCase()] || {
    color: "bg-gradient-to-r from-slate-600 to-slate-500",
    icon: <Trophy className="h-3.5 w-3.5 mr-1" />,
  }

  return (
    <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 border border-slate-700/50 hover:border-slate-600/80 rounded-lg shadow-lg hover:shadow-slate-700/20 transition-all duration-300">
      <div className="p-3">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className={`${difficultyConfig.color} rounded-full px-2.5 py-0.5 text-xs text-white font-medium`}>
              <span className="flex items-center">
                {difficultyConfig.icon}
                {difficulty.toUpperCase()}
              </span>
            </div>
          </div>
          {isHostUser && (
            <button
              onClick={handleDelete}
              className="p-1 text-slate-400 hover:text-rose-400 transition-colors"
              title="Delete this game"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="mt-2 space-y-1.5">
          <div className="flex items-center text-slate-300">
            <Users className="h-3.5 w-3.5 mr-2 text-slate-400" />
            <div className="flex items-center space-x-2 overflow-hidden">
              <span className="text-sm flex items-center space-x-2 min-w-0">
                <span className="flex-shrink-0">Game</span>
                <span
                  onClick={copyId}
                  title="Click to copy ID"
                  className="
                    cursor-pointer hover:underline
                    font-medium text-white
                    truncate flex-shrink basis-[8ch]   /* mobile: ~8 characters */
                    sm:basis-[16ch]                  /* ≥640px: ~16 characters */
                    md:basis-[30ch]                  /* ≥768px: ~30 characters */
                 "
                >
                  {id}
                </span>
                {copied && (
                  <span className="text-xs text-green-400 flex-shrink-0">
                    Copied!
                  </span>
                )}
              </span>
            </div>
          </div>
          <div className="flex items-center text-slate-400 text-xs">
            <Clock className="h-3 w-3 mr-2 text-slate-500" />
            <span>Updated {formattedDate}</span>
          </div>
        </div>

        <div className="mt-3">
          <button
            onClick={() => onJoin(id)}
            className="w-full py-1.5 px-3 flex items-center justify-center bg-slate-800/50 hover:bg-cyan-900/30 text-cyan-400 hover:text-cyan-300 border border-slate-700/50 hover:border-cyan-700/50 rounded-md transition-all text-sm"
          >
            <span className="mr-2">Join Game</span>
            <ArrowRightCircle className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

export default function OpenLobbies({ games, onJoin }: OpenLobbiesProps): React.ReactElement {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
          Open Lobbies
        </h2>
        <div className="text-xs px-2 py-0.5 border border-slate-700 rounded-full text-slate-400">
          {games.length} {games.length === 1 ? "game" : "games"} available
        </div>
      </div>

      {games.length ? (
        <div className="max-h-[350px] overflow-y-auto pr-2 -mr-2 space-y-2.5">
          {games.map((lobby) => (
            <LobbyItem key={lobby.id} lobby={lobby} onJoin={onJoin} />
          ))}
        </div>
      ) : (
        <div className="bg-slate-800/40 border border-slate-700/50 rounded-lg py-6">
          <div className="flex flex-col items-center justify-center text-center space-y-3 px-4">
            <div className="bg-slate-700/30 p-3 rounded-full">
              <Users className="h-5 w-5 text-slate-500" />
            </div>
            <p className="text-slate-400">No active games available</p>
            <p className="text-slate-500 text-sm">Check back later or create your own game</p>
          </div>
        </div>
      )}
    </div>
  )
}
