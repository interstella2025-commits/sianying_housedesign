"use client";

import { ArrowUpRight, Check } from "@phosphor-icons/react";
import type { FormEvent } from "react";
import { useEffect, useRef, useState } from "react";

import { openDirectExternalHref } from "@/app/lib/external-links";
import { company } from "@/data/siangyin";
import { saveInquiry } from "@/lib/inquiries/client";

const inputFields = [
  { name: "name", label: "姓名｜Name", type: "text", autoComplete: "name", required: true, maxLength: 80 },
  { name: "email", label: "信箱｜E-mail", type: "email", autoComplete: "email", required: false, maxLength: 120 },
  { name: "phone", label: "電話｜Phone", type: "tel", autoComplete: "tel", required: true, maxLength: 20 },
  { name: "houseAge", label: "屋齡｜House Age", type: "text", autoComplete: "off", required: false, maxLength: 40 },
  { name: "location", label: "地區｜Location", type: "text", autoComplete: "street-address", required: false, maxLength: 100 },
  { name: "budget", label: "預算｜Budget", type: "text", autoComplete: "off", required: false, maxLength: 60 },
] as const;

export function NewContactForm() {
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
    const value = (name: string) => String(data.get(name) ?? "").trim();
    const displayValue = (name: string) => value(name) || "未填寫";
    const message = [
      "翔胤室內設計諮詢",
      `姓名：${displayValue("name")}`,
      `電話：${displayValue("phone")}`,
      `信箱：${displayValue("email")}`,
      `屋齡：${displayValue("houseAge")}`,
      `地區：${displayValue("location")}`,
      `預算：${displayValue("budget")}`,
      `詢問類型：${displayValue("projectType")}`,
      `需求說明：${displayValue("message")}`,
    ].join("\n");

    openDirectExternalHref(company.lineUrl);

    try {
      const [saved, copied] = await Promise.all([
        saveInquiry({
          formType: "consultation",
          name: value("name"),
          phone: value("phone"),
          email: value("email"),
          houseAge: value("houseAge"),
          location: value("location"),
          budget: value("budget"),
          projectType: value("projectType"),
          message: value("message"),
          sourcePath: window.location.pathname,
          submittedAt: startedAtRef.current,
          website: value("website"),
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

  const buttonText =
    status === "submitting"
      ? "正在儲存…"
      : status === "saved" || status === "line-only"
        ? "已複製，前往 LINE 貼上"
        : status === "saved-manual"
          ? "資料已送出"
          : "前往 LINE 送出";

  const statusText =
    status === "saved"
      ? "諮詢資料已安全儲存，內容也已複製，請在新開啟的 LINE 對話貼上並送出。"
      : status === "saved-manual"
        ? "諮詢資料已安全儲存；LINE 已開啟，請手動輸入需要補充的內容。"
        : status === "line-only"
          ? "LINE 內容已複製，但資料庫暫時無法儲存；請在 LINE 對話貼上並送出。"
          : status === "manual"
            ? "LINE 已開啟，但內容未能自動複製且資料庫暫時無法儲存，請手動輸入或直接來電。"
            : "";

  return (
    <form onSubmit={handleSubmit}>
      {inputFields.map((field) => (
        <label key={field.name}>
          <span>{field.label}</span>
          <input
            name={field.name}
            type={field.type}
            autoComplete={field.autoComplete}
            required={field.required}
            maxLength={field.maxLength}
            minLength={field.name === "phone" ? 8 : undefined}
            inputMode={field.name === "phone" ? "tel" : undefined}
          />
        </label>
      ))}
      <label className="inquiry-honeypot" aria-hidden="true">
        <span>網站</span>
        <input name="website" tabIndex={-1} autoComplete="off" />
      </label>
      <div className="new-contact-message-field">
        <div className="new-contact-message-heading">
          <label htmlFor="new-contact-message">詢問｜Message</label>
          <select name="projectType" defaultValue="住宅空間" aria-label="詢問類型">
            <option>住宅空間</option>
            <option>商業空間</option>
            <option>舊屋翻新</option>
            <option>新成屋</option>
            <option>預售屋客變</option>
            <option>其他</option>
          </select>
        </div>
        <textarea
          id="new-contact-message"
          name="message"
          rows={7}
          maxLength={1200}
        />
      </div>
      <button type="submit" disabled={status === "submitting"}>
        <span>{buttonText}</span>
        {status === "saved" || status === "line-only" ? (
          <Check aria-hidden="true" />
        ) : (
          <ArrowUpRight aria-hidden="true" />
        )}
      </button>
      <p className="new-contact-form-status" aria-live="polite">
        {statusText}
      </p>
    </form>
  );
}
