"use client";

import { ArrowUpRight, Check } from "@phosphor-icons/react";
import { FormEvent, useState } from "react";
import { contact } from "../data";
import { openDirectExternalHref } from "../lib/external-links";

export function ReservationForm() {
  const [copied, setCopied] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const lineId = String(data.get("_u942092586923262663") ?? "").trim();
    const messageParts = [
      "翔胤室內設計丈量預約",
      `稱呼：${data.get("_u531257087533523220[name]") ?? ""}`,
      `手機：${data.get("_u727225007500950533[number]") ?? ""}`,
      `裝修地點：${data.get("_u435919755631730200") ?? ""}`,
    ];

    if (lineId) {
      messageParts.splice(3, 0, `LINE ID：${lineId}`);
    }

    const message = messageParts.join("\n");

    try {
      await navigator.clipboard.writeText(message);
      setCopied(true);
    } catch {
      setCopied(false);
    }

    openDirectExternalHref(contact.lineUrl);
  }

  return (
    <form className="reservation-form" onSubmit={handleSubmit}>
      <label className="field-block">
        <span>稱呼 *</span>
        <input name="_u531257087533523220[name]" autoComplete="name" required />
      </label>

      <div className="field-row">
        <label className="field-block">
          <span>您的手機 *</span>
          <input
            name="_u727225007500950533[number]"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            required
          />
        </label>
        <label className="field-block">
          <span>LINE ID</span>
          <input name="_u942092586923262663" />
        </label>
      </div>

      <fieldset className="location-fieldset">
        <legend>裝修地點 *</legend>
        <div className="location-options">
          {["台北市", "新北市", "桃園", "新竹", "宜蘭市", "其它"].map((place) => (
            <label key={place}>
              <input name="_u435919755631730200" type="radio" value={place} required />
              <span>{place}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <button className="primary-button form-submit" type="submit">
        <span>{copied ? "已複製，前往 LINE 貼上" : "發送表單"}</span>
        {copied ? <Check aria-hidden="true" /> : <ArrowUpRight aria-hidden="true" />}
      </button>
      {copied ? (
        <p className="form-helper" aria-live="polite">
          預約內容已複製，請在 LINE 對話貼上並送出。
        </p>
      ) : null}
    </form>
  );
}
