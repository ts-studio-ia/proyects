import type { TraceEvent } from "../trace/types.js";

export type LoopSignature = {
  commandSequence: string[];
  windowMs: number;
  detectedAt: string;
  occurrences: number;
};

export type LoopDetectionResult =
  | { detected: false }
  | { detected: true; signature: LoopSignature; recommendation: "escalate" | "circuit_break" | "warn" };

const DEFAULT_WINDOW_MS = 60_000;
const LOOP_THRESHOLD = 3;

export const buildCommandSequence = (events: TraceEvent[], windowMs = DEFAULT_WINDOW_MS): string[] => {
  const cutoff = Date.now() - windowMs;
  return events
    .filter((e) => new Date(e.timestamp).getTime() > cutoff)
    .filter((e) => e.actor === "agent" || e.actor === "system")
    .map((e) => e.type);
};

const detectRepeatingPattern = (sequence: string[]): { pattern: string[]; occurrences: number } | undefined => {
  if (sequence.length < 4) return undefined;
  for (let len = 2; len <= Math.floor(sequence.length / 2); len++) {
    const pattern = sequence.slice(-len);
    let count = 0;
    for (let i = 0; i <= sequence.length - len; i++) {
      const window = sequence.slice(i, i + len);
      if (window.every((v, idx) => v === pattern[idx])) count++;
    }
    if (count >= LOOP_THRESHOLD) return { pattern, occurrences: count };
  }
  return undefined;
};

export const detectLoop = (events: TraceEvent[], windowMs = DEFAULT_WINDOW_MS): LoopDetectionResult => {
  const sequence = buildCommandSequence(events, windowMs);
  const match = detectRepeatingPattern(sequence);
  if (!match) return { detected: false };

  const signature: LoopSignature = {
    commandSequence: match.pattern,
    windowMs,
    detectedAt: new Date().toISOString(),
    occurrences: match.occurrences
  };

  const recommendation = match.occurrences >= LOOP_THRESHOLD * 2
    ? "circuit_break"
    : match.occurrences >= LOOP_THRESHOLD
    ? "escalate"
    : "warn";

  return { detected: true, signature, recommendation };
};
