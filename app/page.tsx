
"use client";
import React, { useState, useEffect } from "react";
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

const YOUTUBE_PLAYLIST_ITEM_API =
  "https://www.googleapis.com/youtube/v3/playlistItems";
  // "https://www.googleapis.com/youtube/v3/commentThreads"


async function getPlaylistData(): Promise<PlaylistData> {
  try {
    const res = await fetch(
      `${YOUTUBE_PLAYLIST_ITEM_API}?part=snippet&playlistId=RDJI4B8pj5G1M&maxResults=10&key=${process.env.YOUTUBE_APIKEY}`,
      { cache: "no-store" }
    );

    if (!res.ok) {
      console.error("YouTube API error:", res.statusText);
      console.log(await res.text()); // See the error details
      return { items: [] };
    }

    const data = await res.json();
    return data;
  } catch (err) {
    console.error("Fetch failed:", err);
    return { items: [] };
  }
}
// ...existing PlaylistItem and PlaylistData interfaces...

// Fetch comments for a video from your backend
async function fetchComments(videoId: string): Promise<string[]> {
  try {
    const res = await fetch(`/api/comments?videoId=${videoId}`);
    if (!res.ok) return [];
    const data = await res.json();
    return data.comments || [];
  } catch {
    return [];
  }
}

// Post a comment to your backend
async function postComment(videoId: string, text: string): Promise<boolean> {
  try {
    const res = await fetch(`/api/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ videoId, text }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

function PlaylistCard({ item }: { item: PlaylistItem }) {
  const snippet = item.snippet || {};
  const title = snippet.title || "No title";
  const description = snippet.description || "No description";
  const videoId = snippet.resourceId?.videoId || "";
  const thumbnail = snippet.thumbnails?.medium;
  const [comments, setComments] = useState<string[]>([]);
  const [commentInput, setCommentInput] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (videoId) {
      fetchComments(videoId).then(setComments);
    }
  }, [videoId]);

  const handleCommentPost = async () => {
    if (!commentInput.trim()) return;
    setLoading(true);
    const success = await postComment(videoId, commentInput);
    setLoading(false);
    if (success) {
      setCommentInput("");
      fetchComments(videoId).then(setComments);
    } else {
      alert("Failed to post comment. Make sure you are signed in.");
    }
  };

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
      <div>
        <textarea
          className="w-full border rounded p-2 mt-2"
          placeholder="Add a comment..."
          value={commentInput}
          onChange={(e) => setCommentInput(e.target.value)}
          disabled={loading}
        />
        <button
          className="bg-blue-500 text-white px-3 py-1 rounded mt-2"
          onClick={handleCommentPost}
          disabled={loading}
        >
          {loading ? "Posting..." : "Post Comment"}
        </button>
        <div className="mt-2">
          <strong>Comments:</strong>
          <ul className="list-disc pl-4">
            {comments.map((cmt, idx) => (
              <li key={idx}>{cmt}</li>
            ))}
          </ul>
        </div>
      </div>
    </li>
  );
}

export default async function Page() {
    const data = await getPlaylistData();


  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-center">My YouTube Playlist</h1>
      {data.items?.length === 0 ? (
        <p className="text-center text-gray-500">No playlist items found.</p>
      ) : (
        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {(data.items ?? []).map((item) => (
            <PlaylistCard key={item.id} item={item} />
          ))}
        </ul>
      )}
    </div>
  );
}
// ...existing code...