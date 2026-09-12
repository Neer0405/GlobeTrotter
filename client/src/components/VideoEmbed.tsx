import React from 'react';
import { Play, Film } from 'lucide-react';

interface VideoEmbedProps {
  url: string;
  poster?: string;
  className?: string;
  autoPlay?: boolean;
}

// Helper function to detect if a URL is a video link
export const isVideoUrl = (url?: string): boolean => {
  if (!url) return false;
  const lower = url.toLowerCase();
  return (
    lower.includes('youtube.com') ||
    lower.includes('youtu.be') ||
    lower.includes('vimeo.com') ||
    lower.endsWith('.mp4') ||
    lower.endsWith('.webm') ||
    lower.endsWith('.mov') ||
    lower.includes('video')
  );
};

// Helper function to extract YouTube Embed URL
export const getYouTubeEmbedUrl = (url: string): string | null => {
  try {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=|shorts\/)([^#&?]*).*/;
    const match = url.match(regExp);

    if (match && match[2].length === 11) {
      return `https://www.youtube.com/embed/${match[2]}?autoplay=0&rel=0&modestbranding=1`;
    }
  } catch (e) {
    console.error('Error parsing YouTube URL:', e);
  }
  return null;
};

// Helper function to extract Vimeo Embed URL
export const getVimeoEmbedUrl = (url: string): string | null => {
  try {
    const match = url.match(/vimeo\.com\/(?:.*\/)?(\d+)/);
    if (match && match[1]) {
      return `https://player.vimeo.com/video/${match[1]}?title=0&byline=0&portrait=0`;
    }
  } catch (e) {
    console.error('Error parsing Vimeo URL:', e);
  }
  return null;
};

export const VideoEmbed: React.FC<VideoEmbedProps> = ({ url, poster, className = '', autoPlay = false }) => {
  if (!url) return null;

  const ytEmbed = getYouTubeEmbedUrl(url);
  if (ytEmbed) {
    return (
      <div className={`relative w-full aspect-video rounded-2xl overflow-hidden shadow-lg bg-black border border-slate-800 ${className}`}>
        <iframe
          src={ytEmbed}
          title="Travel Video"
          className="w-full h-full border-0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        ></iframe>
      </div>
    );
  }

  const vimeoEmbed = getVimeoEmbedUrl(url);
  if (vimeoEmbed) {
    return (
      <div className={`relative w-full aspect-video rounded-2xl overflow-hidden shadow-lg bg-black border border-slate-800 ${className}`}>
        <iframe
          src={vimeoEmbed}
          title="Travel Video"
          className="w-full h-full border-0"
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
        ></iframe>
      </div>
    );
  }

  // Direct MP4 / WebM / HTML5 video link fallback
  return (
    <div className={`relative w-full aspect-video rounded-2xl overflow-hidden shadow-lg bg-slate-950 border border-slate-800 ${className}`}>
      <video
        src={url}
        poster={poster}
        controls
        autoPlay={autoPlay}
        className="w-full h-full object-cover"
      >
        Your browser does not support playing this video.
      </video>
    </div>
  );
};
