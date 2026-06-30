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
        background: locked ? "#fca5a5" : "#dc2626",
        border: "none",
        color: "#fff",
        borderRadius: 8,
        padding: "9px 18px",
        fontSize: 13,
        fontWeight: 600,
        cursor: locked ? "not-allowed" : "pointer",
        opacity: locked ? 0.7 : 1,
      }}
    >
      Sign Out
    </button>
  );
}