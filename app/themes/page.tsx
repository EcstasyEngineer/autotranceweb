"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Theme {
  id: string;
  name: string;
  description: string;
  keywords: string[];
  tags: string[];
  mantras: Array<{
    id: string;
    text: string;
    difficulty: string;
    points: number;
  }>;
}

export default function ThemesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [themes, setThemes] = useState<Theme[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (status === "loading") return;
    if (!session) {
      router.push("/auth/signin");
      return;
    }
  }, [session, status, router]);

  useEffect(() => {
    if (session) {
      loadThemes();
    }
  }, [session]);

  const loadThemes = async () => {
    try {
      const res = await fetch("/api/themes");
      if (res.ok) {
        const data = await res.json();
        setThemes(data);
      }
    } catch (e) {
      console.error("Failed to load themes", e);
    } finally {
      setLoading(false);
    }
  };

  const initializeThemes = async () => {
    try {
      const response = await fetch("/api/themes", { method: "POST" });
      if (response.ok) {
        await loadThemes();
      }
    } catch (error) {
      console.error("Error initializing themes:", error);
    }
  };

  const categories = ["All", ...new Set(themes.flatMap((t) => t.tags))];
  const filtered = themes.filter((t) => {
    const categoryMatch = selectedCategory === "All" || t.tags.includes(selectedCategory);
    const q = query.trim().toLowerCase();
    const queryMatch = !q ||
      t.name.toLowerCase().includes(q) ||
      t.description.toLowerCase().includes(q) ||
      t.keywords.join(" ").toLowerCase().includes(q);
    return categoryMatch && queryMatch;
  });

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
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Themes</h1>
              <p className="text-gray-600">Browse available themes and their mantras</p>
            </div>
            <div className="flex gap-2">
              <Link href="/session/builder" className="bg-pink-600 text-white px-4 py-2 rounded-lg hover:bg-pink-700">
                Create Session
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="md:col-span-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search themes..."
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
            />
          </div>
          <div className="md:col-span-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg"
            >
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div className="md:col-span-1 flex items-end">
            {themes.length === 0 && (
              <button onClick={initializeThemes} className="w-full bg-pink-600 text-white px-4 py-3 rounded-lg hover:bg-pink-700">
                Initialize Themes
              </button>
            )}
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-pink-600 mx-auto" />
            <p className="mt-4 text-gray-600">Loading themes...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600">No themes found. Try a different filter.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((theme) => (
              <div key={theme.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{theme.name}</h3>
                    <p className="text-sm text-gray-600 mt-1 line-clamp-3">{theme.description}</p>
                  </div>
                  <span className="text-xs text-gray-500">{theme.mantras.length} mantras</span>
                </div>
                <div className="flex gap-2 mt-3 flex-wrap">
                  {theme.tags.slice(0, 3).map((tag) => (
                    <span key={tag} className="bg-pink-100 text-pink-700 px-2 py-1 rounded text-xs">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

