"use client";

import { Pause, Play, SpeakerHigh, SpeakerSlash } from "@phosphor-icons/react";
import { usePathname } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { siteMusic } from "../data";

type SiteMusicContextValue = {
  playing: boolean;
  currentTime: number;
  duration: number;
  muted: boolean;
  togglePlay: () => void;
  toggleMute: () => void;
  seek: (time: number) => void;
  setVolume: (volume: number) => void;
};

const SiteMusicContext = createContext<SiteMusicContextValue | null>(null);

function formatTime(seconds: number) {
  if (!Number.isFinite(seconds) || seconds < 0) return "00:00";
  const total = Math.floor(seconds);
  const minutes = Math.floor(total / 60);
  const remainder = total % 60;
  return `${String(minutes).padStart(2, "0")}:${String(remainder).padStart(2, "0")}`;
}

export function useSiteMusic() {
  const context = useContext(SiteMusicContext);
  if (!context) {
    throw new Error("useSiteMusic must be used within SiteMusicProvider");
  }
  return context;
}

export function SiteMusicBar({ className }: { className?: string }) {
  const { playing, currentTime, duration, muted, togglePlay, toggleMute, seek, setVolume } =
    useSiteMusic();
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className={`site-music__bar${className ? ` ${className}` : ""}`}>
      <button type="button" className="site-music__play" onClick={togglePlay} aria-label={playing ? "暫停音樂" : "播放音樂"}>
        {playing ? <Pause aria-hidden="true" weight="fill" /> : <Play aria-hidden="true" weight="fill" />}
      </button>
      <span className="site-music__time">{formatTime(currentTime)}</span>
      <input
        className="site-music__progress"
        type="range"
        min={0}
        max={100}
        step={0.1}
        value={progress}
        aria-label="播放進度"
        onChange={(event) => {
          if (duration <= 0) return;
          seek((Number(event.target.value) / 100) * duration);
        }}
      />
      <span className="site-music__time">{formatTime(duration)}</span>
      <button type="button" className="site-music__mute" onClick={toggleMute} aria-label={muted ? "取消靜音" : "靜音"}>
        {muted ? <SpeakerSlash aria-hidden="true" /> : <SpeakerHigh aria-hidden="true" />}
      </button>
      <input
        className="site-music__volume"
        type="range"
        min={0}
        max={1}
        step={0.01}
        defaultValue={siteMusic.defaultVolume}
        aria-label="音量"
        onChange={(event) => setVolume(Number(event.target.value))}
      />
    </div>
  );
}

export function SiteMusicPlayer() {
  return (
    <div className="site-music site-music--embedded">
      <SiteMusicBar />
      <p className="site-music__credit">{siteMusic.credit}</p>
    </div>
  );
}

export function SiteMusicProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const audioRef = useRef<HTMLAudioElement>(null);
  const startedRef = useRef(false);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [muted, setMuted] = useState(false);

  const tryPlay = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.volume = siteMusic.defaultVolume;
    try {
      await audio.play();
      startedRef.current = true;
      setPlaying(true);
    } catch {
      setPlaying(false);
    }
  }, []);

  useEffect(() => {
    void tryPlay();

    const resumeOnInteract = () => {
      void tryPlay();
    };

    document.addEventListener("pointerdown", resumeOnInteract, { once: true });
    document.addEventListener("keydown", resumeOnInteract, { once: true });

    return () => {
      document.removeEventListener("pointerdown", resumeOnInteract);
      document.removeEventListener("keydown", resumeOnInteract);
    };
  }, [tryPlay]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    const onTimeUpdate = () => setCurrentTime(audio.currentTime);
    const onLoadedMetadata = () => setDuration(audio.duration);
    const onDurationChange = () => setDuration(audio.duration);

    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);
    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("loadedmetadata", onLoadedMetadata);
    audio.addEventListener("durationchange", onDurationChange);

    return () => {
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("loadedmetadata", onLoadedMetadata);
      audio.removeEventListener("durationchange", onDurationChange);
    };
  }, []);

  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) void audio.play();
    else audio.pause();
  }, []);

  const toggleMute = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.muted = !audio.muted;
    setMuted(audio.muted);
  }, []);

  const seek = useCallback((time: number) => {
    const audio = audioRef.current;
    if (!audio || !Number.isFinite(time)) return;
    audio.currentTime = time;
    setCurrentTime(time);
  }, []);

  const setVolume = useCallback((volume: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = volume;
    if (volume > 0 && audio.muted) {
      audio.muted = false;
      setMuted(false);
    }
  }, []);

  const value: SiteMusicContextValue = {
    playing,
    currentTime,
    duration,
    muted,
    togglePlay,
    toggleMute,
    seek,
    setVolume,
  };

  const showFloating = pathname !== "/";

  return (
    <SiteMusicContext.Provider value={value}>
      <audio ref={audioRef} src={siteMusic.src} loop preload="auto" />
      {children}
      {showFloating && (
        <div className="site-music site-music--floating" aria-label="背景音樂">
          <SiteMusicBar />
          <p className="site-music__credit">{siteMusic.credit}</p>
        </div>
      )}
    </SiteMusicContext.Provider>
  );
}
