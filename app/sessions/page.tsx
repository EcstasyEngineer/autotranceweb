"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Plus, Play } from "lucide-react";

interface UserSession {
  id: string;
  name: string;
  duration?: number;
  createdAt: string;
  phases: Array<{
    id: string;
    name: string;
    duration: number;
    player: string;
    cycler: string;
  }>;
}

export default function SessionsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [sessions, setSessions] = useState<UserSession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "loading") return;
    if (!session) {
      router.push("/auth/signin");
      return;
    }
  }, [session, status, router]);

  useEffect(() => {
    if (session) {
      // Placeholder: load user's sessions from API when available
      setSessions([]);
      setLoading(false);
    }
  }, [session]);

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-pink-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!session) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Your Sessions</h1>
              <p className="text-gray-600">Create and manage your personalized sessions</p>
            </div>
            <Link href="/session/builder" className="bg-pink-600 text-white px-4 py-2 rounded-lg hover:bg-pink-700 flex items-center gap-2">
              <Plus className="w-4 h-4" />
              New Session
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-pink-600 mx-auto" />
            <p className="mt-4 text-gray-600">Loading sessions...</p>
          </div>
        ) : sessions.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-lg shadow-sm">
            <Play className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No sessions yet</h3>
            <p className="text-gray-600 mb-4">Create your first personalized hypnosis session</p>
            <Link href="/session/builder" className="bg-pink-600 text-white px-4 py-2 rounded-lg hover:bg-pink-700">
              Create Session
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sessions.map((s) => (
              <div key={s.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-gray-900">{s.name}</h3>
                    <p className="text-sm text-gray-600">
                      {s.duration ? `${Math.floor((s.duration || 0) / 60)} minutes` : "Custom duration"} • {s.phases.length} phases
                    </p>
                    <p className="text-xs text-gray-500 mt-1">Created {new Date(s.createdAt).toLocaleDateString()}</p>
                  </div>
                  <Link href={`/session/player/${s.id}`} className="bg-pink-600 text-white px-3 py-1 rounded text-sm hover:bg-pink-700">
                    Play
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

