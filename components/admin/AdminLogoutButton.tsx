"use client";

export function AdminLogoutButton() {
  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    window.location.href = "/admin/login";
  }

  return (
    <button className="admin-button secondary" type="button" onClick={handleLogout}>
      登出
    </button>
  );
}
