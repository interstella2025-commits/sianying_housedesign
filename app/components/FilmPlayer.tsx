"use client";

import Image from "next/image";
import { Play } from "@phosphor-icons/react";
import { useState } from "react";

type FilmPlayerProps = {
  videoId: string;
  poster: string;
  title: string;
};

export function FilmPlayer({ videoId, poster, title }: FilmPlayerProps) {
  const [playing, setPlaying] = useState(false);

  if (playing) {
    return (
      <div className="film-media film-media-playing">
        <iframe
          src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
      </div>
    );
  }

  return (
    <button
      type="button"
      className="film-media"
      onClick={() => setPlaying(true)}
      aria-label={`播放${title}`}
    >
      <Image
        src={poster}
        alt={`${title}影片預覽`}
        fill
        sizes="(max-width: 899px) 100vw, 62vw"
      />
      <span className="play-button" aria-hidden="true">
        <Play weight="fill" />
      </span>
    </button>
  );
}
