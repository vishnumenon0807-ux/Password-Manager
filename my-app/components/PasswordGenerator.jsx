"use client";

import { useState } from "react";
import { DEFAULT_OPTIONS, generatePassword } from "@/lib/generator";
import StrengthMeter from "@/components/StrengthMeter";

const TOGGLES = [
  ["uppercase", "Uppercase (A-Z)"],
  ["lowercase", "Lowercase (a-z)"],
  ["numbers", "Numbers (0-9)"],
  ["symbols", "Symbols (!@#...)"],
  ["avoidAmbiguous", "Avoid look-alikes (l, 1, O, 0)"],
];

function safeGenerate(options) {
  try {
    return generatePassword(options);
  } catch {
    return "";
  }
}

export default function PasswordGenerator({ onUse }) {
  const [options, setOptions] = useState(DEFAULT_OPTIONS);
  const [value, setValue] = useState(() => safeGenerate(DEFAULT_OPTIONS));

  function update(change) {
    const next = { ...options, ...change };
    // Don't let every character type be switched off.
    const anySet = next.uppercase || next.lowercase || next.numbers || next.symbols;
    if (!anySet) return;
    setOptions(next);
    setValue(safeGenerate(next));
  }

  return (
    <div className="space-y-4 rounded-2xl border border-slate-700 bg-slate-900/70 p-5">
      <div className="flex flex-wrap items-center gap-2">
        <code className="min-w-0 flex-1 break-all rounded-lg bg-slate-950 px-3 py-2 font-mono text-cyan-300">
          {value}
        </code>
        <button type="button" onClick={() => setValue(safeGenerate(options))} className="btn-ghost">
          Regenerate
        </button>
        <button
          type="button"
          onClick={() => onUse(value)}
          className="rounded-lg bg-cyan-500 px-3 py-1.5 text-sm font-semibold text-slate-950 hover:bg-cyan-400"
        >
          Use this password
        </button>
      </div>

      <StrengthMeter password={value} showTips={false} />

      <label className="block text-sm text-slate-300">
        Length: <span className="font-semibold text-white">{options.length}</span>
        <input
          type="range"
          min={8}
          max={64}
          value={options.length}
          onChange={(e) => update({ length: Number(e.target.value) })}
          className="mt-2 w-full accent-cyan-500"
        />
      </label>

      <div className="grid gap-2 sm:grid-cols-2">
        {TOGGLES.map(([key, label]) => (
          <label key={key} className="flex cursor-pointer items-center gap-2 text-sm text-slate-300">
            <input
              type="checkbox"
              checked={options[key]}
              onChange={(e) => update({ [key]: e.target.checked })}
              className="h-4 w-4 accent-cyan-500"
            />
            {label}
          </label>
        ))}
      </div>
    </div>
  );
}
