"use client";

import { useState } from "react";

// `getText` can be async, so the password is only fetched from the server
// when the user actually clicks copy.
export default function CopyButton({ getText, label = "Copy", className = "btn-ghost" }) {
  const [state, setState] = useState("idle");

  async function handleClick() {
    try {
      const text = await getText();
      await navigator.clipboard.writeText(text);
      setState("copied");
    } catch {
      setState("failed");
    }
    setTimeout(() => setState("idle"), 2000);
  }

  return (
    <button type="button" onClick={handleClick} className={className}>
      {state === "copied" ? "Copied" : state === "failed" ? "Couldn't copy" : label}
    </button>
  );
}
