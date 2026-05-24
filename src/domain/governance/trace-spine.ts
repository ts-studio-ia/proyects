import type { TraceEvent, TraceEventBus } from "../trace/types.js";

export type TraceSpineSubscriber = { id: string; handler: (event: TraceEvent) => void };

export type TraceSpine = {
  bus: TraceEventBus;
  subscribe: (subscriber: TraceSpineSubscriber) => () => void;
  publish: (event: TraceEvent) => void;
  getSnapshot: () => TraceEvent[];
  getByType: (type: TraceEvent["type"]) => TraceEvent[];
  getByNodeId: (nodeId: string) => TraceEvent[];
};

export const createTraceSpine = (bus: TraceEventBus): TraceSpine => {
  const subscribers = new Map<string, TraceSpineSubscriber>();

  return {
    bus,
    subscribe: (subscriber) => {
      subscribers.set(subscriber.id, subscriber);
      const unsub = bus.subscribe(subscriber.handler);
      return () => {
        subscribers.delete(subscriber.id);
        unsub();
      };
    },
    publish: (event) => bus.publish(event),
    getSnapshot: () => bus.getSnapshot(),
    getByType: (type) => bus.getSnapshot().filter((e) => e.type === type),
    getByNodeId: (nodeId) => bus.getSnapshot().filter((e) => e.nodeId === nodeId)
  };
};
