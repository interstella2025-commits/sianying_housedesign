"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const response = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });

    if (!response.ok) {
      const payload = (await response.json()) as { error?: string };
      setError(payload.error ?? "登入失敗");
      setLoading(false);
      return;
    }

    router.push("/new/admin");
    router.refresh();
  }

  return (
    <div className="admin-page admin-login-page">
      <div className="admin-header">
        <div>
          <p className="admin-note">SIANG YIN INTERIOR DESIGN</p>
          <h1>翔胤後台登入</h1>
        </div>
      </div>
      <form className="admin-form admin-login-form" onSubmit={handleSubmit}>
        <label>
          管理密碼
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="current-password"
            required
          />
        </label>
        {error ? <p className="admin-note is-error">{error}</p> : null}
        <button className="admin-button" type="submit" disabled={loading}>
          {loading ? "登入中…" : "登入"}
        </button>
      </form>
    </div>
  );
}
