"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import type { SianyingPageSettings } from "@/lib/puck/page-settings";
import { parseYouTubeId } from "@/lib/video-embed";

type ShortVideoShowcaseProps = {
  settings: SianyingPageSettings | null;
};

type ShortVideo = {
  id: string;
  title: string;
  url: string;
};

type EmbedContext = {
  origin: string;
  referrer: string;
};

function thumbnailUrl(videoId: string) {
  return `https://i.ytimg.com/vi/${videoId}/oar2.jpg`;
}

export function ShortVideoShowcase({ settings }: ShortVideoShowcaseProps) {
  const videos = useMemo<ShortVideo[]>(() => {
    return (settings?.shortVideos ?? []).flatMap((video) => {
      const id = parseYouTubeId(video.url);
      return id ? [{ id, title: video.title.trim() || "新作品分享", url: video.url }] : [];
    });
  }, [settings?.shortVideos]);
  const sectionRef = useRef<HTMLElement | null>(null);
  const thumbnailRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isInView, setIsInView] = useState(false);
  const [embedContext, setEmbedContext] = useState<EmbedContext | null>(null);

  const selectedVideo = videos[selectedIndex] ?? videos[0];

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        const visible = entry.isIntersecting && entry.intersectionRatio >= 0.16;
        setIsInView(visible);
        if (visible) {
          setEmbedContext((current) => current ?? {
            origin: window.location.origin,
            referrer: window.location.href,
          });
        }
      },
      { threshold: [0, 0.16, 0.4], rootMargin: "80px 0px" },
    );
    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  const selectVideo = useCallback((index: number) => {
    setSelectedIndex(index);
    thumbnailRefs.current[index]?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
  }, []);

  const moveSelection = useCallback((direction: -1 | 1) => {
    if (!videos.length) return;
    selectVideo((selectedIndex + direction + videos.length) % videos.length);
  }, [selectVideo, selectedIndex, videos.length]);

  if (!videos.length || !selectedVideo) return null;

  const embedParams = new URLSearchParams({
    autoplay: "0",
    playsinline: "1",
    mute: "0",
    controls: "1",
    rel: "0",
  });
  if (embedContext) {
    embedParams.set("origin", embedContext.origin);
    embedParams.set("widget_referrer", embedContext.referrer);
  }

  return (
    <section
      ref={sectionRef}
      id="short-videos"
      className="section-anchor short-video-section"
      aria-labelledby="short-video-title"
    >
      <div className="short-video-column">
        <h2 id="short-video-title" className="portfolio-section-title">
          {settings?.shortVideoTitle || "新作品分享"}
        </h2>

        <div className="short-video-stage">
          <div
            className="short-video-player"
            style={{ backgroundImage: `url(${thumbnailUrl(selectedVideo.id)})` }}
          >
            {isInView && embedContext ? (
              <iframe
                key={selectedVideo.id}
                src={`https://www.youtube.com/embed/${selectedVideo.id}?${embedParams.toString()}`}
                title={selectedVideo.title}
                allow="autoplay; encrypted-media; picture-in-picture; web-share"
                referrerPolicy="origin-when-cross-origin"
                allowFullScreen
              />
            ) : null}
          </div>

          <a className="short-video-current" href={selectedVideo.url} target="_blank" rel="noreferrer noopener">
            <h3>{selectedVideo.title}</h3>
            <span>點擊影片即有聲播放</span>
          </a>

          <div className="short-video-browser" aria-label="選擇短影音">
            {videos.length > 1 ? (
              <button type="button" className="short-video-arrow" onClick={() => moveSelection(-1)} aria-label="上一支影片">
                ←
              </button>
            ) : null}

            <div className="short-video-thumbnails">
              {videos.map((video, index) => (
                <button
                  key={`${video.id}-${index}`}
                  ref={(node) => { thumbnailRefs.current[index] = node; }}
                  type="button"
                  className={`short-video-thumbnail${index === selectedIndex ? " is-active" : ""}`}
                  onClick={() => selectVideo(index)}
                  aria-label={`選擇 ${video.title}`}
                  aria-pressed={index === selectedIndex}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={thumbnailUrl(video.id)} alt="" />
                  <span>{video.title}</span>
                </button>
              ))}
            </div>

            {videos.length > 1 ? (
              <button type="button" className="short-video-arrow" onClick={() => moveSelection(1)} aria-label="下一支影片">
                →
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
