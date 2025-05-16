"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { LogOut } from 'lucide-react';
import type { User } from '@supabase/supabase-js';

export default function Home(): React.ReactElement {
  const [user, setUser] = useState<User | null>(null);
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getUser()
      .then(({ data, error }) => {
        if (error) {
          console.error('Error fetching user:', error);
        } else {
          setUser(data.user ?? null);
        }
      });
  }, [supabase]);

  const handleSignOut = async (): Promise<void> => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Sign out error:', error);
    } else {
      router.push('/login');
    }
  };

  return (
    <div className="bg-black text-white min-h-screen flex flex-col items-center justify-center">
      <p>Hello world</p>
      <p>Logged in: {user?.email ?? ''}</p>
      <button
        type="button"
        onClick={handleSignOut}
        className="mt-4 flex items-center px-4 py-2 bg-gray-900 rounded hover:bg-gray-800 transition"
      >
        <LogOut className="mr-2" size={16} />
        Sign out
      </button>
    </div>
  );
}