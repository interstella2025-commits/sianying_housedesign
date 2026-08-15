"use client";

import { ArrowUpRight, Check } from "@phosphor-icons/react";
import { FormEvent, useState } from "react";
import { contact } from "../data";

export function ReservationForm() {
  const [copied, setCopied] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const message = [
      "翔胤室內設計丈量預約",
      `姓名：${data.get("_u531257087533523220[first]") ?? ""} ${data.get("_u531257087533523220[last]") ?? ""}`,
      `手機：${data.get("_u727225007500950533[number]") ?? ""}`,
      `LINE ID：${data.get("_u942092586923262663") ?? ""}`,
      `Email：${data.get("_u498455407613694885") ?? ""}`,
      `裝修地點：${data.get("_u435919755631730200") ?? ""}`,
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
      <div className="field-row">
        <label className="field-block">
          <span>名字 *</span>
          <input name="_u531257087533523220[first]" autoComplete="given-name" required />
        </label>
        <label className="field-block">
          <span>姓氏 *</span>
          <input name="_u531257087533523220[last]" autoComplete="family-name" required />
        </label>
      </div>

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
          <span>LINE ID *</span>
          <input name="_u942092586923262663" required />
        </label>
      </div>

      <label className="field-block">
        <span>Email *</span>
        <input name="_u498455407613694885" type="email" autoComplete="email" required />
      </label>

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

      <label className="consent-field">
        <input name="opted_in" type="checkbox" value="1" />
        <span>我同意接收營銷和宣傳材料</span>
      </label>

      <button className="primary-button form-submit" type="submit">
        <span>{copied ? "已複製，前往 LINE 貼上" : "發送表單"}</span>
        {copied ? <Check aria-hidden="true" /> : <ArrowUpRight aria-hidden="true" />}
      </button>
      <p className="form-helper" aria-live="polite">
        {copied
          ? "預約內容已複製，請在新開啟的 LINE 對話中貼上並送出。"
          : "送出後會開啟 LINE，預約內容不會儲存在此網站。"}
      </p>
    </form>
  );
}
