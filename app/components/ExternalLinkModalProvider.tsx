"use client";

import { X } from "@phosphor-icons/react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

type ExternalLinkState = {
  url: string;
  title: string;
  embedSrc?: string;
} | null;

type ExternalLinkModalContextValue = {
  openExternalLink: (url: string, title?: string, embedSrc?: string) => void;
  closeExternalLink: () => void;
};

const ExternalLinkModalContext = createContext<ExternalLinkModalContextValue | null>(null);

function getLinkTitle(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "外部連結";
  }
}

export function useExternalLinkModal() {
  const context = useContext(ExternalLinkModalContext);
  if (!context) {
    throw new Error("useExternalLinkModal must be used within ExternalLinkModalProvider");
  }
  return context;
}

export function ExternalLinkModalProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<ExternalLinkState>(null);
  const [closing, setClosing] = useState(false);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const closeTimerRef = useRef<number | null>(null);

  const closeExternalLink = useCallback(() => {
    setClosing(true);
    closeTimerRef.current = window.setTimeout(() => {
      setState(null);
      setClosing(false);
    }, 280);
  }, []);

  const openExternalLink = useCallback((url: string, title?: string, embedSrc?: string) => {
    if (closeTimerRef.current !== null) {
      window.clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }

    setClosing(false);
    setState({
      url,
      title: title?.trim() || getLinkTitle(url),
      embedSrc,
    });
  }, []);

  useEffect(() => {
    return () => {
      if (closeTimerRef.current !== null) {
        window.clearTimeout(closeTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!state) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const frame = window.requestAnimationFrame(() => {
      closeButtonRef.current?.focus({ preventScroll: true });
    });

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeExternalLink();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [closeExternalLink, state]);

  return (
    <ExternalLinkModalContext.Provider value={{ openExternalLink, closeExternalLink }}>
      {children}
      {state ? (
        <div
          className="external-link-backdrop"
          data-closing={closing}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeExternalLink();
            }
          }}
        >
          <div
            className="external-link-panel"
            role="dialog"
            aria-modal="true"
            aria-labelledby="external-link-title"
          >
            <header className="external-link-header">
              <div>
                <span>External Preview</span>
                <h2 id="external-link-title">{state.title}</h2>
              </div>
              <button
                ref={closeButtonRef}
                type="button"
                onClick={closeExternalLink}
                aria-label="關閉外部連結視窗"
              >
                <X aria-hidden="true" />
              </button>
            </header>
            <p className="external-link-note">您仍停留在翔胤室內設計網站，關閉視窗即可回到原頁面。</p>
            <div className="external-link-frame-wrap">
              <iframe
                key={state.embedSrc ?? state.url}
                src={state.embedSrc ?? state.url}
                title={state.title}
                className="external-link-frame"
                referrerPolicy="no-referrer-when-downgrade"
                sandbox="allow-forms allow-modals allow-orientation-lock allow-pointer-lock allow-popups allow-popups-to-escape-sandbox allow-presentation allow-same-origin allow-scripts"
              />
            </div>
          </div>
        </div>
      ) : null}
    </ExternalLinkModalContext.Provider>
  );
}
