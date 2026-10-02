"use client";

import { MessengerLogoIcon } from "@phosphor-icons/react";
import { usePathname } from "next/navigation";

const messengerUrl = "https://m.me/Wanna.Ju.design";

export function FacebookMessengerButton() {
  const pathname = usePathname();

  if (pathname.startsWith("/admin") || pathname.startsWith("/new/admin")) {
    return null;
  }

  return (
    <a
      className="facebook-messenger-fab"
      href={messengerUrl}
      target="_blank"
      rel="noreferrer noopener"
      aria-label="使用 Facebook Messenger 聯絡翔胤室內設計"
      title="Messenger 聯絡我們"
    >
      <MessengerLogoIcon aria-hidden="true" size={30} weight="fill" />
      <span>Messenger</span>
    </a>
  );
}
