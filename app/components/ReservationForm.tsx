"use client";

import { ArrowUpRight, Check } from "@phosphor-icons/react";
import { FormEvent, useEffect, useRef, useState } from "react";
import { contact } from "../data";
import { openDirectExternalHref } from "../lib/external-links";
import { saveInquiry } from "@/lib/inquiries/client";

export function ReservationForm() {
  const submittingRef = useRef(false);
  const startedAtRef = useRef(0);
  const [status, setStatus] = useState<
    "idle" | "submitting" | "saved" | "saved-manual" | "line-only" | "manual"
  >("idle");

  useEffect(() => {
    startedAtRef.current = Date.now();
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submittingRef.current) return;

    submittingRef.current = true;
    setStatus("submitting");
    const data = new FormData(event.currentTarget);
    const name = String(data.get("_u531257087533523220[name]") ?? "").trim();
    const phone = String(data.get("_u727225007500950533[number]") ?? "").trim();
    const lineId = String(data.get("_u942092586923262663") ?? "").trim();
    const location = String(data.get("_u435919755631730200") ?? "").trim();
    const messageParts = [
      "翔胤室內設計丈量預約",
      `稱呼：${name}`,
      `手機：${phone}`,
      `裝修地點：${location}`,
    ];

    if (lineId) {
      messageParts.splice(3, 0, `LINE ID：${lineId}`);
    }

    const message = messageParts.join("\n");

    openDirectExternalHref(contact.lineUrl);

    try {
      const [saved, copied] = await Promise.all([
        saveInquiry({
          formType: "reservation",
          name,
          phone,
          lineId,
          location,
          projectType: "丈量預約",
          sourcePath: window.location.pathname,
          submittedAt: startedAtRef.current,
          website: String(data.get("website") ?? "").trim(),
        }).then(
          () => true,
          () => false,
        ),
        navigator.clipboard.writeText(message).then(
          () => true,
          () => false,
        ),
      ]);

      if (saved && copied) setStatus("saved");
      else if (saved) setStatus("saved-manual");
      else if (copied) setStatus("line-only");
      else setStatus("manual");
    } finally {
      submittingRef.current = false;
      startedAtRef.current = Date.now();
    }
  }

  const copied = status === "saved" || status === "line-only";
  const helperText =
    status === "saved"
      ? "預約資料已安全儲存，內容也已複製，請在 LINE 對話貼上並送出。"
      : status === "saved-manual"
        ? "預約資料已安全儲存；LINE 已開啟，請手動輸入需要補充的內容。"
        : status === "line-only"
          ? "內容已複製，但資料庫暫時無法儲存；請在 LINE 對話貼上並送出。"
          : status === "manual"
            ? "LINE 已開啟，但資料庫與自動複製暫時無法使用，請手動輸入或直接來電。"
            : "";

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

      <label className="inquiry-honeypot" aria-hidden="true">
        <span>網站</span>
        <input name="website" tabIndex={-1} autoComplete="off" />
      </label>

      <button
        className="primary-button form-submit"
        type="submit"
        disabled={status === "submitting"}
      >
        <span>
          {status === "submitting" ? "正在儲存…" : copied ? "已複製，前往 LINE 貼上" : "發送表單"}
        </span>
        {copied ? <Check aria-hidden="true" /> : <ArrowUpRight aria-hidden="true" />}
      </button>
      {helperText ? (
        <p className="form-helper" aria-live="polite">
          {helperText}
        </p>
      ) : null}
    </form>
  );
}
