"use client";

import { useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { CustomEase } from "gsap/CustomEase";

gsap.registerPlugin(ScrollTrigger, CustomEase);
CustomEase.create("syEaseOut", "0.23,1,0.32,1");
CustomEase.create("syEaseInOut", "0.77,0,0.175,1");

export function MotionDirector() {
  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const media = gsap.matchMedia();
    const context = gsap.context(() => {
      if (reduceMotion) {
        gsap.set("[data-hero-word], [data-hero-media], [data-reveal], [data-project-card], [data-wipe], [data-process-step], [data-float-card], [data-award-year], [data-works-card]", {
          clearProps: "all",
        });
        return;
      }

      const intro = gsap.timeline({ defaults: { ease: "syEaseOut" } });
      intro
        .fromTo(
          "[data-hero-kicker]",
          { opacity: 0, transform: "translateY(18px)" },
          { opacity: 1, transform: "translateY(0px)", duration: 0.7 },
        )
        .fromTo(
          "[data-hero-word]",
          { transform: "translateY(110%)" },
          {
            transform: "translateY(0%)",
            duration: 1.05,
            stagger: 0.07,
          },
          "-=0.46",
        )
        .fromTo(
          "[data-hero-summary]",
          { opacity: 0, transform: "translateY(22px)" },
          { opacity: 1, transform: "translateY(0px)", duration: 0.78 },
          "-=0.62",
        )
        .fromTo(
          "[data-hero-media]",
          { opacity: 0, clipPath: "inset(14% 0% 0% 0% round 32px)" },
          {
            opacity: 1,
            clipPath: "inset(0% 0% 0% 0% round 32px)",
            duration: 1.15,
          },
          "-=0.55",
        );

      gsap.utils.toArray<HTMLElement>("[data-reveal]").forEach((element) => {
        gsap.fromTo(
          element,
          { opacity: 0, transform: "translateY(42px)" },
          {
            opacity: 1,
            transform: "translateY(0px)",
            duration: 0.9,
            ease: "syEaseOut",
            scrollTrigger: {
              trigger: element,
              start: "top 86%",
              once: true,
            },
          },
        );
      });

      gsap.utils.toArray<HTMLElement>("[data-wipe]").forEach((element) => {
        gsap.fromTo(
          element,
          { opacity: 0.35, clipPath: "inset(0 100% 0 0 round 28px)" },
          {
            opacity: 1,
            clipPath: "inset(0 0% 0 0 round 28px)",
            duration: 1.15,
            ease: "syEaseInOut",
            scrollTrigger: {
              trigger: element,
              start: "top 88%",
              once: true,
            },
          },
        );
      });

      gsap.utils.toArray<HTMLElement>("[data-process-step]").forEach((element, index) => {
        gsap.fromTo(
          element,
          { opacity: 0.22, transform: `translateX(${index % 2 === 0 ? 54 : 34}px)` },
          {
            opacity: 1,
            transform: "translateX(0px)",
            duration: 0.95,
            ease: "syEaseOut",
            scrollTrigger: {
              trigger: element,
              start: "top 82%",
              once: true,
            },
          },
        );
      });

      gsap.utils.toArray<HTMLElement>("[data-float-card]").forEach((element, index) => {
        gsap.to(element, {
          transform: `translateY(-${8 + (index % 3) * 3}px) rotate(${index % 2 === 0 ? -0.5 : 0.5}deg)`,
          duration: 2.7 + (index % 3) * 0.45,
          ease: "sine.inOut",
          repeat: -1,
          yoyo: true,
        });
      });

      gsap.utils.toArray<HTMLElement>("[data-award-year]").forEach((element) => {
        gsap.fromTo(
          element.children,
          { transform: "translateY(18%)" },
          {
            transform: "translateY(-6%)",
            ease: "none",
            scrollTrigger: {
              trigger: element,
              start: "top bottom",
              end: "bottom top",
              scrub: 1,
            },
          },
        );
      });

      gsap.utils.toArray<HTMLElement>("[data-works-card]").forEach((element, index) => {
        gsap.fromTo(
          element,
          {
            opacity: 0,
            clipPath: "inset(12% 0 0 0 round 28px)",
            transform: `translateY(${36 + (index % 3) * 10}px) scale(0.975)`,
          },
          {
            opacity: 1,
            clipPath: "inset(0% 0 0 0 round 28px)",
            transform: "translateY(0px) scale(1)",
            duration: 1.05,
            ease: "syEaseOut",
            scrollTrigger: {
              trigger: element,
              start: "top 88%",
              once: true,
            },
          },
        );
      });

      gsap.utils.toArray<HTMLElement>("[data-parallax]").forEach((element) => {
        const image = element.querySelector("img");
        if (!image) return;
        gsap.fromTo(
          image,
          { transform: "translateY(-4%) scale(1.06)" },
          {
            transform: "translateY(4%) scale(1.06)",
            ease: "none",
            scrollTrigger: {
              trigger: element,
              start: "top bottom",
              end: "bottom top",
              scrub: 0.8,
            },
          },
        );
      });

      media.add("(min-width: 900px)", () => {
        gsap.utils.toArray<HTMLElement>("[data-project-stack]").forEach((stack) => {
          const cards = gsap.utils.toArray<HTMLElement>("[data-stack-card]", stack);
          const lastCard = cards.at(-1);
          if (!lastCard) return;

          cards.forEach((card, index) => {
            if (index === cards.length - 1) return;
            const nextCard = cards[index + 1];
            const content = card.querySelector<HTMLElement>(".featured-stack-inner") ?? card;

            ScrollTrigger.create({
              trigger: card,
              start: "top top",
              endTrigger: lastCard,
              end: "top top",
              pin: true,
              pinSpacing: false,
            });

            gsap.to(content, {
              transform: "scale(0.925)",
              opacity: 0.42,
              ease: "none",
              scrollTrigger: {
                trigger: nextCard,
                start: "top bottom",
                end: "top top",
                scrub: true,
              },
            });
          });
        });

        gsap.utils.toArray<HTMLElement>("[data-horizontal]").forEach((wrapper) => {
          const track = wrapper.querySelector<HTMLElement>("[data-horizontal-track]");
          if (!track) return;

          const distance = () => Math.max(0, track.scrollWidth - window.innerWidth);
          gsap.to(track, {
            transform: () => `translate3d(${-distance()}px, 0, 0)`,
            ease: "none",
            scrollTrigger: {
              trigger: wrapper,
              start: "top top",
              end: () => `+=${distance()}`,
              pin: true,
              scrub: 1,
              invalidateOnRefresh: true,
            },
          });
        });
      });

      media.add("(max-width: 899px)", () => {
        gsap.utils.toArray<HTMLElement>("[data-project-card]").forEach((card, index) => {
          gsap.fromTo(
            card,
            { opacity: 0, transform: "translateY(32px)" },
            {
              opacity: 1,
              transform: "translateY(0px)",
              duration: 0.72,
              delay: Math.min(index, 2) * 0.04,
              ease: "syEaseOut",
              scrollTrigger: {
                trigger: card,
                start: "top 88%",
                once: true,
              },
            },
          );
        });
      });
    });

    ScrollTrigger.refresh();
    return () => {
      media.revert();
      context.revert();
    };
  }, []);

  return null;
}
