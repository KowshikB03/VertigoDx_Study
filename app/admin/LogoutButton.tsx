"use client";

export default function LogoutButton({ locked = false }: { locked?: boolean }) {
  async function logout() {
    if (locked) return;
    await fetch("/api/logout", { method: "POST" });
    window.location.href = "/login";
  }
  return (
    <button
      onClick={logout}
      disabled={locked}
      title={
        locked
          ? "Submit ongoing questionnaire to exit, otherwise submission to this question will not be recorded."
          : "Sign out"
      }
      style={{
        background: "transparent",
        border: `1px solid ${locked ? "var(--line)" : "var(--line)"}`,
        color: locked ? "var(--ink-faint)" : "var(--ink-dim)",
        borderRadius: 8,
        padding: "9px 16px",
        fontSize: 13,
        cursor: locked ? "not-allowed" : "pointer",
        opacity: locked ? 0.55 : 1,
      }}
    >
      Sign out
    </button>
  );
}