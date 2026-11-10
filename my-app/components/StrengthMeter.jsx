"use client";

import { checkStrength } from "@/lib/strength";
import { STRENGTH_COLOURS, STRENGTH_TEXT } from "@/lib/strength-styles";

export default function StrengthMeter({ password, showTips = true }) {
  if (!password) return null;

  const { score, label, feedback } = checkStrength(password);

  return (
    <div className="space-y-2" aria-live="polite">
      <div className="flex gap-1">
        {[0, 1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className={`h-1.5 flex-1 rounded-full ${i <= score ? STRENGTH_COLOURS[score] : "bg-slate-700"}`}
          />
        ))}
      </div>
      <p className={`text-sm font-medium ${STRENGTH_TEXT[score]}`}>{label}</p>
      {showTips && feedback.length > 0 && score < 4 && (
        <ul className="list-disc space-y-0.5 pl-5 text-xs text-slate-400">
          {feedback.slice(0, 3).map((tip) => (
            <li key={tip}>{tip}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function StrengthBadge({ strength }) {
  if (!strength) {
    return (
      <span className="rounded-full bg-slate-700 px-3 py-1 text-xs text-slate-300">
        Can&apos;t decrypt
      </span>
    );
  }
  return (
    <span
      className={`rounded-full bg-slate-800 px-3 py-1 text-xs font-medium ring-1 ring-slate-700 ${STRENGTH_TEXT[strength.score]}`}
    >
      {strength.label}
    </span>
  );
}
