"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

type PanoramaViewerProps = {
  src: string;
  poster?: string;
  className?: string;
  autoRotate?: number;
  hint?: string;
  showHint?: boolean;
  ariaLabel?: string;
  posterPriority?: boolean;
};

export function PanoramaViewer({
  src,
  poster,
  className,
  autoRotate = 0,
  hint = "拖曳環視",
  showHint = true,
  ariaLabel = "360 度環景瀏覽",
  posterPriority = false,
}: PanoramaViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [readySrc, setReadySrc] = useState<string | null>(null);
  const loading = readySrc !== src;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let mounted = true;
    let frameId = 0;
    let renderer: import("three").WebGLRenderer | null = null;
    let resizeObserver: ResizeObserver | null = null;
    let teardown: (() => void) | undefined;

    const MAX_FOV = 95;
    const DEFAULT_FOV = MAX_FOV;
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    );

    const pointer = {
      active: false,
      lastX: 0,
      lastY: 0,
      lon: 0,
      lat: 0,
      fov: DEFAULT_FOV,
    };

    const onPointerDown = (event: PointerEvent) => {
      pointer.active = true;
      pointer.lastX = event.clientX;
      pointer.lastY = event.clientY;
      container.setPointerCapture(event.pointerId);
    };

    const onPointerMove = (event: PointerEvent) => {
      if (!pointer.active) return;
      const deltaX = event.clientX - pointer.lastX;
      const deltaY = event.clientY - pointer.lastY;
      pointer.lastX = event.clientX;
      pointer.lastY = event.clientY;
      pointer.lon -= deltaX * 0.12;
      pointer.lat += deltaY * 0.12;
      pointer.lat = Math.max(-55, Math.min(55, pointer.lat));
    };

    const onPointerUp = (event: PointerEvent) => {
      pointer.active = false;
      if (container.hasPointerCapture(event.pointerId)) {
        container.releasePointerCapture(event.pointerId);
      }
    };

    const boot = async (): Promise<() => void> => {
      const THREE = await import("three");
      if (!mounted || !container) return () => {};

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(pointer.fov, 1, 0.1, 1100);
      camera.position.set(0, 0, 0.01);

      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: "high-performance" });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2.5));
      renderer.domElement.style.display = "block";
      renderer.domElement.style.width = "100%";
      renderer.domElement.style.height = "100%";
      container.appendChild(renderer.domElement);

      const texture = await new THREE.TextureLoader().loadAsync(src);
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.generateMipmaps = false;
      texture.minFilter = THREE.LinearFilter;
      texture.magFilter = THREE.LinearFilter;
      texture.anisotropy = renderer.capabilities.getMaxAnisotropy();

      const geometry = new THREE.SphereGeometry(500, 96, 56);
      geometry.scale(-1, 1, 1);
      const material = new THREE.MeshBasicMaterial({ map: texture });
      const sphere = new THREE.Mesh(geometry, material);
      scene.add(sphere);

      const resize = () => {
        if (!renderer) return;
        const width = container.clientWidth;
        const height = container.clientHeight;
        if (!width || !height) return;
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height, false);
      };

      resizeObserver = new ResizeObserver(resize);
      resizeObserver.observe(container);
      resize();

      container.addEventListener("pointerdown", onPointerDown);
      container.addEventListener("pointermove", onPointerMove);
      container.addEventListener("pointerup", onPointerUp);
      container.addEventListener("pointercancel", onPointerUp);

      const render = () => {
        if (!mounted || !renderer) return;
        if (autoRotate && !pointer.active && !prefersReducedMotion.matches) {
          pointer.lon += autoRotate;
        }

        const phi = THREE.MathUtils.degToRad(90 - pointer.lat);
        const theta = THREE.MathUtils.degToRad(pointer.lon);
        camera.fov = pointer.fov;
        camera.updateProjectionMatrix();
        camera.lookAt(
          500 * Math.sin(phi) * Math.cos(theta),
          500 * Math.cos(phi),
          500 * Math.sin(phi) * Math.sin(theta),
        );

        renderer.render(scene, camera);
        frameId = window.requestAnimationFrame(render);
      };

      render();
      if (mounted) {
        window.requestAnimationFrame(() => {
          if (mounted) setReadySrc(src);
        });
      }

      return () => {
        container.removeEventListener("pointerdown", onPointerDown);
        container.removeEventListener("pointermove", onPointerMove);
        container.removeEventListener("pointerup", onPointerUp);
        container.removeEventListener("pointercancel", onPointerUp);
        resizeObserver?.disconnect();
        window.cancelAnimationFrame(frameId);
        geometry.dispose();
        material.dispose();
        texture.dispose();
        renderer?.dispose();
        if (renderer?.domElement.parentElement === container) {
          container.removeChild(renderer.domElement);
        }
      };
    };

    boot()
      .then((dispose) => {
        if (!mounted) {
          dispose();
          return;
        }
        teardown = dispose;
      })
      .catch(() => {
        if (mounted) setReadySrc(src);
      });

    return () => {
      mounted = false;
      teardown?.();
    };
  }, [autoRotate, src]);

  return (
    <div
      className={`panorama-viewer${loading ? " is-loading" : " is-ready"}${className ? ` ${className}` : ""}`}
      ref={containerRef}
      aria-busy={loading}
      aria-label={ariaLabel}
      role="img"
    >
      {poster ? (
        <Image
          className="panorama-viewer__poster"
          src={poster}
          alt=""
          aria-hidden="true"
          fill
          loading={posterPriority ? "eager" : "lazy"}
          sizes="100vw"
        />
      ) : null}
      <div className="panorama-viewer__loading" aria-live="polite">
        <span className="panorama-viewer__loading-spinner" aria-hidden="true" />
        <span className="panorama-viewer__loading-copy">
          <strong>3D 空間載入中</strong>
          <small>高畫質環景準備中，請稍候</small>
        </span>
      </div>
      {showHint && hint ? <span className="panorama-viewer__hint">{hint}</span> : null}
    </div>
  );
}
