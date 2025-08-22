"use client";
import React, { useState } from "react";
import styles from "./page.module.css";

interface PlaylistItem {
  id: string;
  snippet?: {
    title?: string;
    description?: string;
    thumbnails?: {
      medium?: {
        url?: string;
        width?: number;
        height?: number;
      };
    };
    resourceId?: {
      videoId?: string;
    };
  };
}

interface PlaylistData {
  items?: PlaylistItem[];
}

const apiKey = process.env.NEXT_PUBLIC_YOUTUBE_APIKEY;
const YOUTUBE_PLAYLIST_ITEM_API =
  "https://www.googleapis.com/youtube/v3/playlistItems";
const YOUTUBE_SEARCH_API =
  "https://www.googleapis.com/youtube/v3/search";

async function searchPlaylistByName(query: string): Promise<string | null> {
  try {
    const res = await fetch(
      `${YOUTUBE_SEARCH_API}?part=snippet&type=playlist&q=${encodeURIComponent(
        query
      )}&key=${apiKey}`,
      { cache: "no-store" }
    );

    if (!res.ok) return null;

    const data = await res.json();
    if (data.items && data.items.length > 0) {
      return data.items[0].id.playlistId; // first matching playlist
    }
    return null;
  } catch {
    return null;
  }
}

async function getPlaylistData(playlistId: string): Promise<PlaylistData> {
  try {
    const res = await fetch(
      `${YOUTUBE_PLAYLIST_ITEM_API}?part=snippet&maxResults=10&playlistId=${playlistId}&key=${apiKey}`,
      { cache: "no-store" }
    );

    if (!res.ok) {
      return { items: [] };
    }

    const data = await res.json();

    // ✅ filter out private/deleted
    const filtered = (data.items || []).filter(
      (item: PlaylistItem) =>
        item.snippet &&
        item.snippet.title &&
        item.snippet.title.toLowerCase() !== "private video" &&
        item.snippet.title.toLowerCase() !== "deleted video"
    );

    return { items: filtered };
  } catch {
    return { items: [] };
  }
}

function PlaylistCard({ item }: { item: PlaylistItem }) {
  const snippet = item.snippet || {};
  const videoId = snippet.resourceId?.videoId || "";
  const title = snippet.title ?? "No title";
  const thumbnail = snippet.thumbnails?.medium;

  return (
    <li key={item.id} className={styles.card}>
      <a
        href={`https://www.youtube.com/watch?v=${videoId}`}
        target="_blank"
        rel="noopener noreferrer"
      >
        {thumbnail?.url && (
          <img
            width={thumbnail.width}
            height={thumbnail.height}
            src={thumbnail.url}
            alt={title}
            className="mb-2 rounded"
          />
        )}
        <h3 className="font-semibold text-lg">{title}</h3>
      </a>
    </li>
  );
}

export default function Page() {
  const [query, setQuery] = useState("");
  const [data, setData] = useState<PlaylistData>({ items: [] });
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setSearched(true);

    const playlistId = await searchPlaylistByName(query.trim());
    if (playlistId) {
      const playlist = await getPlaylistData(playlistId);
      setData(playlist);
    } else {
      setData({ items: [] });
    }

    setLoading(false);
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-center">
        YouTube Playlist Search by Name
      </h1>
      <div className="flex justify-center mb-6">
        <input
          type="text"
          className="border rounded p-2 w-80"
          placeholder="Enter Playlist Name"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded ml-2"
          onClick={handleSearch}
          disabled={loading}
        >
          {loading ? "Searching..." : "Search"}
        </button>
      </div>
      {searched && !loading && data.items?.length === 0 && (
        <p className="text-center text-gray-500">
          No public playlist items found.
        </p>
      )}
      <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {(data.items ?? []).map((item) => (
          <PlaylistCard key={item.id} item={item} />
        ))}
      </ul>
    </div>
  );
}
