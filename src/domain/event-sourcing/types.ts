export type EventEnvelope = {
  id: string;
  streamId: string;
  tenantId: string;
  projectId: string;
  eventType: string;
  payload: unknown;
  causationId?: string | undefined;
  correlationId?: string | undefined;
  occurredAt: string;
  sequence: number;
  hash: string;
};

export type LedgerEntry = {
  id: string;
  envelopeId: string;
  appendedAt: string;
  previousHash: string;
  hash: string;
  tenantId: string;
};

export type EventStream = {
  id: string;
  tenantId: string;
  projectId: string;
  events: EventEnvelope[];
  sequence: number;
};

export type AppendResult = { ok: true; entry: LedgerEntry } | { ok: false; reason: string };
