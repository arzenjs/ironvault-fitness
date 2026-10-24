"use client";

import Link from "next/link";

/** Last-resort boundary: renders its own <html> when the root layout fails. */
export default function GlobalError({ error, reset }) {
  return (
    <html lang="en">
      <body
        style={{
          background: "#070709",
          color: "#f5f5f3",
          fontFamily: "system-ui, sans-serif",
          display: "grid",
          placeItems: "center",
          minHeight: "100vh",
          margin: 0,
          padding: "2rem",
          textAlign: "center",
        }}
      >
        <div>
          <h1 style={{ fontSize: "2rem", marginBottom: "0.75rem" }}>The app could not start</h1>
          <p style={{ color: "#9b9ba6", maxWidth: "32rem", lineHeight: 1.6 }}>
            A server error interrupted rendering. Check the deployment logs, verify the environment variables
            listed in <code>.env.example</code>, then reload.
          </p>
          {error?.digest ? (
            <p style={{ fontFamily: "monospace", fontSize: "0.75rem", color: "#9b9ba6", marginTop: "1rem" }}>
              Reference: {error.digest}
            </p>
          ) : null}
          <div style={{ marginTop: "1.5rem", display: "flex", gap: "0.75rem", justifyContent: "center" }}>
            <button
              type="button"
              onClick={() => reset()}
              style={{
                padding: "0.7rem 1.2rem",
                borderRadius: "999px",
                background: "#e5231b",
                color: "#fff",
                border: "none",
                cursor: "pointer",
              }}
            >
              Reload
            </button>
            <Link
              href="/"
              style={{
                padding: "0.7rem 1.2rem",
                borderRadius: "999px",
                border: "1px solid rgba(255,255,255,0.2)",
                color: "#f5f5f3",
              }}
            >
              Home
            </Link>
          </div>
        </div>
      </body>
    </html>
  );
}
