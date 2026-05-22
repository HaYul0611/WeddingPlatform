'use client';

import { useState, useEffect, useRef } from 'react';
import { Play } from 'lucide-react';

interface BgmPlayerProps {
  url: string;
  autoPlay?: boolean;
  loop?: boolean;
  volume?: number;
}

function resolveUrl(url: string): string {
  if (!url) return '/BGM/AboveTheTreetops.mp3';
  if (url.startsWith('blob:') || url.startsWith('http') || url.startsWith('/')) return url;
  return `/BGM/${url}`;
}

export default function BgmPlayer({ url, autoPlay, loop = true, volume = 50 }: BgmPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const src = resolveUrl(url);

  // 이퀄라이저 CSS
  useEffect(() => {
    const id = 'bgm-visualizer-style';
    if (!document.getElementById(id)) {
      const s = document.createElement('style');
      s.id = id;
      s.textContent = `@keyframes bgm-visualizer{0%,100%{height:4px}50%{height:14px}}`;
      document.head.appendChild(s);
    }
  }, []);

  useEffect(() => {
    const win = window as any;
    const el = audioRef.current;
    if (!el) return;

    el.volume = Math.min(1, Math.max(0, (volume ?? 50) / 100));

    const shouldPlay = autoPlay || win.globalAudioPlaying === true;
    
    if (shouldPlay) {
      const tryPlay = () => {
        el.play()
          .then(() => { setIsPlaying(true); win.globalAudioPlaying = true; })
          .catch(() => setIsPlaying(false));
      };

      if (el.readyState >= 3) {
        tryPlay();
      } else {
        el.addEventListener('canplay', tryPlay, { once: true });
      }

      // 브라우저 정책으로 인해 실패한 경우 대비 사용자 상호작용 시 재생 시도
      const handleInteraction = () => {
        if (el.paused) {
          el.play()
            .then(() => { setIsPlaying(true); win.globalAudioPlaying = true; })
            .catch(() => {});
        }
        document.removeEventListener('click', handleInteraction);
        document.removeEventListener('touchstart', handleInteraction);
      };

      document.addEventListener('click', handleInteraction);
      document.addEventListener('touchstart', handleInteraction);

      return () => {
        document.removeEventListener('click', handleInteraction);
        document.removeEventListener('touchstart', handleInteraction);
      };
    } else {
      el.pause();
      setIsPlaying(false);
      win.globalAudioPlaying = false;
    }
  }, [autoPlay, src]);

  // 볼륨 동기화
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = Math.min(1, Math.max(0, (volume ?? 50) / 100));
    }
  }, [volume]);

  // 오프닝 탭 플레이 버튼
  useEffect(() => {
    const handler = () => {
      const el = audioRef.current;
      if (!el) return;
      const win = window as any;
      if (el.paused) {
        el.play().then(() => { setIsPlaying(true); win.globalAudioPlaying = true; }).catch(() => { });
      } else {
        el.pause(); setIsPlaying(false); win.globalAudioPlaying = false;
      }
    };
    window.addEventListener('bgm-toggle-play', handler);
    return () => window.removeEventListener('bgm-toggle-play', handler);
  }, []);

  // Seek 이벤트
  useEffect(() => {
    const handler = (e: Event) => {
      const t = (e as CustomEvent).detail?.time;
      if (typeof t === 'number' && audioRef.current) {
        audioRef.current.currentTime = t;
        setCurrentTime(t);
      }
    };
    window.addEventListener('bgm-seek', handler);
    return () => window.removeEventListener('bgm-seek', handler);
  }, []);

  // 상태 방출
  useEffect(() => {
    window.dispatchEvent(new CustomEvent('bgm-state-changed', {
      detail: { isPlaying, currentTime, duration }
    }));
  }, [isPlaying, currentTime, duration]);

  const handleTogglePlay = () => {
    const el = audioRef.current;
    if (!el) return;
    const win = window as any;
    if (el.paused) {
      el.play().then(() => { setIsPlaying(true); win.globalAudioPlaying = true; }).catch(() => { });
    } else {
      el.pause(); setIsPlaying(false); win.globalAudioPlaying = false;
    }
  };

  return (
    <>
      <button
        onClick={handleTogglePlay}
        className="h-[36px] w-[36px] rounded-full bg-white/95 backdrop-blur-sm shadow-[0_2px_8px_rgba(0,0,0,0.08)] border border-black/5 flex items-center justify-center cursor-pointer transition-transform hover:scale-105 active:scale-95 z-50 pointer-events-auto"
      >
        {isPlaying ? (
          <div className="flex items-center gap-[2.5px] h-[14px]">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="w-[2.5px] bg-gray-400 rounded-full"
                style={{ animation: 'bgm-visualizer 1.2s ease-in-out infinite', animationDelay: `${i * -0.25}s`, height: '14px' }}
              />
            ))}
          </div>
        ) : (
          <Play size={16} className="text-[#9ca3af] ml-0.5" strokeWidth={2.5} />
        )}
      </button>

      <audio
        ref={audioRef}
        src={src}
        loop={loop}
        preload="auto"
        onPlay={() => { setIsPlaying(true); (window as any).globalAudioPlaying = true; }}
        onPause={() => setIsPlaying(false)}
        onTimeUpdate={() => { if (audioRef.current) setCurrentTime(Math.floor(audioRef.current.currentTime)); }}
        onLoadedMetadata={() => { if (audioRef.current) setDuration(audioRef.current.duration); }}
        onEnded={() => { if (!loop) setIsPlaying(false); }}
      />
    </>
  );
}
