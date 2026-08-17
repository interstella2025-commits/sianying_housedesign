"use client";

import type { ComponentProps, MouseEvent } from "react";
import { isDirectExternalHref, openDirectExternalHref } from "../lib/external-links";
import { useExternalLinkModal } from "./ExternalLinkModalProvider";

type ExternalPopupLinkProps = ComponentProps<"a"> & {
  popupTitle?: string;
};

function shouldOpenModal(event: MouseEvent<HTMLAnchorElement>) {
  return (
    event.button === 0 &&
    !event.metaKey &&
    !event.ctrlKey &&
    !event.shiftKey &&
    !event.altKey
  );
}

export function ExternalPopupLink({
  href,
  onClick,
  popupTitle,
  ...props
}: ExternalPopupLinkProps) {
  const { openExternalLink } = useExternalLinkModal();

  return (
    <a
      href={href}
      rel={props.rel ?? "noreferrer"}
      onClick={(event) => {
        onClick?.(event);
        if (event.defaultPrevented || typeof href !== "string") {
          return;
        }

        if (isDirectExternalHref(href)) {
          if (shouldOpenModal(event)) {
            event.preventDefault();
            openDirectExternalHref(href);
          }
          return;
        }

        if (!shouldOpenModal(event)) {
          return;
        }

        event.preventDefault();
        openExternalLink(href, popupTitle);
      }}
      {...props}
    />
  );
}
