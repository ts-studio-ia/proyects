import type { EventEnvelope, EventStream, LedgerEntry, AppendResult } from "./types.js";

const hashContent = (content: string): string => {
  let h = 0;
  for (let i = 0; i < content.length; i++) {
    h = (Math.imul(31, h) + content.charCodeAt(i)) | 0;
  }
  return Math.abs(h).toString(16).padStart(8, "0");
};

const computeEnvelopeHash = (env: Omit<EventEnvelope, "hash">): string =>
  hashContent(`${env.id}|${env.streamId}|${env.eventType}|${env.occurredAt}|${env.sequence}`);

export const createEventStream = (tenantId: string, projectId: string): EventStream => ({
  id: `stream-${tenantId}-${projectId}-${Date.now()}`,
  tenantId,
  projectId,
  events: [],
  sequence: 0
});

export const appendToStream = (
  stream: EventStream,
  eventType: string,
  payload: unknown,
  correlationId?: string
): { stream: EventStream; envelope: EventEnvelope } => {
  const sequence = stream.sequence + 1;
  const base = {
    id: `env-${sequence}-${Date.now()}`,
    streamId: stream.id,
    tenantId: stream.tenantId,
    projectId: stream.projectId,
    eventType,
    payload,
    correlationId,
    occurredAt: new Date().toISOString(),
    sequence
  };
  const envelope: EventEnvelope = { ...base, hash: computeEnvelopeHash(base) };
  return {
    stream: { ...stream, events: [...stream.events, envelope], sequence },
    envelope
  };
};

export const appendToLedger = (
  entries: LedgerEntry[],
  envelope: EventEnvelope
): AppendResult => {
  const previousHash = entries.at(-1)?.hash ?? "genesis";
  const hash = hashContent(`${previousHash}|${envelope.hash}|${envelope.occurredAt}`);
  const entry: LedgerEntry = {
    id: `le-${Date.now()}`,
    envelopeId: envelope.id,
    appendedAt: new Date().toISOString(),
    previousHash,
    hash,
    tenantId: envelope.tenantId
  };
  return { ok: true, entry };
};

export const verifyLedgerIntegrity = (entries: LedgerEntry[]): boolean => {
  for (let i = 1; i < entries.length; i++) {
    const prev = entries[i - 1];
    const curr = entries[i];
    if (!prev || !curr) return false;
    if (curr.previousHash !== prev.hash) return false;
  }
  return true;
};

export const replayStream = (stream: EventStream, upToSequence?: number): EventEnvelope[] =>
  upToSequence !== undefined
    ? stream.events.filter((e) => e.sequence <= upToSequence)
    : [...stream.events];
