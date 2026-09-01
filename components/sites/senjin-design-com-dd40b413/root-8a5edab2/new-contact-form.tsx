"use client";

import { ArrowUpRight, Check } from "@phosphor-icons/react";
import type { FormEvent } from "react";
import { useRef, useState } from "react";

import { openDirectExternalHref } from "@/app/lib/external-links";
import { company } from "@/data/siangyin";

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
  const [status, setStatus] = useState<"idle" | "copied" | "manual">("idle");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submittingRef.current) return;

    submittingRef.current = true;
    const data = new FormData(event.currentTarget);
    const value = (name: string) => String(data.get(name) ?? "").trim() || "未填寫";
    const message = [
      "翔胤室內設計諮詢",
      `姓名：${value("name")}`,
      `電話：${value("phone")}`,
      `信箱：${value("email")}`,
      `屋齡：${value("houseAge")}`,
      `地區：${value("location")}`,
      `預算：${value("budget")}`,
      `詢問類型：${value("projectType")}`,
      `需求說明：${value("message")}`,
    ].join("\n");

    openDirectExternalHref(company.lineUrl);

    try {
      await navigator.clipboard.writeText(message);
      setStatus("copied");
    } catch {
      setStatus("manual");
    } finally {
      submittingRef.current = false;
    }
  }

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
      <button type="submit">
        <span>{status === "copied" ? "已複製，前往 LINE 貼上" : "前往 LINE 送出"}</span>
        {status === "copied" ? <Check aria-hidden="true" /> : <ArrowUpRight aria-hidden="true" />}
      </button>
      <p className="new-contact-form-status" aria-live="polite">
        {status === "copied"
          ? "諮詢內容已複製，請在新開啟的 LINE 對話貼上並送出。"
          : status === "manual"
            ? "瀏覽器未允許自動複製；LINE 已開啟，請手動輸入內容，或直接來電與我們聯繫。"
            : ""}
      </p>
    </form>
  );
}
