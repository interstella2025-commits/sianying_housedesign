"use client";

import { ArrowUpRight, Check } from "@phosphor-icons/react";
import Link from "next/link";
import { FormEvent, useState } from "react";
import { contact, routes } from "../data";

export function ReservationForm() {
  const [copied, setCopied] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const message = [
      "翔胤室內設計丈量預約",
      `姓名：${data.get("name") ?? ""}`,
      `手機：${data.get("phone") ?? ""}`,
      `LINE ID：${data.get("line_id") ?? ""}`,
      `Email：${data.get("email") ?? ""}`,
      `裝修地點：${data.get("location") ?? ""}`,
    ].join("\n");

    try {
      await navigator.clipboard.writeText(message);
      setCopied(true);
    } catch {
      setCopied(false);
    }

    window.open(contact.lineUrl, "_blank", "noopener,noreferrer");
  }

  return (
    <form className="reservation-form" onSubmit={handleSubmit}>
      <label className="field-block">
        <span>姓名 *</span>
        <input name="name" autoComplete="name" required />
      </label>

      <label className="field-block">
        <span>手機號碼 *</span>
        <input
          name="phone"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          required
        />
      </label>

      <div className="field-row">
        <label className="field-block">
          <span>LINE ID</span>
          <input name="line_id" />
        </label>
        <label className="field-block">
          <span>Email</span>
          <input name="email" type="email" autoComplete="email" />
        </label>
      </div>

      <fieldset className="location-fieldset">
        <legend>裝修地點 *</legend>
        <div className="location-options">
          {["台北市", "新北市", "桃園", "新竹", "宜蘭市", "其它"].map((place) => (
            <label key={place}>
              <input name="location" type="radio" value={place} required />
              <span>{place}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <label className="consent-field">
        <input name="privacy_consent" type="checkbox" value="1" required />
        <span>
          我已閱讀並同意
          <Link href={routes.privacy}>隱私權政策</Link>
        </span>
      </label>

      <label className="consent-field">
        <input name="marketing_consent" type="checkbox" value="1" />
        <span>我願意接收翔胤室內設計的服務與活動資訊（選填）</span>
      </label>

      <button className="primary-button form-submit" type="submit">
        <span>{copied ? "已複製，前往 LINE 貼上" : "開啟 LINE 傳送預約資料"}</span>
        {copied ? <Check aria-hidden="true" /> : <ArrowUpRight aria-hidden="true" />}
      </button>
      <p className="form-helper" aria-live="polite">
        {copied
          ? "預約內容已複製，請在新開啟的 LINE 對話中貼上並送出。"
          : "本網站不會儲存您填寫的預約資料。"}
      </p>
    </form>
  );
}
