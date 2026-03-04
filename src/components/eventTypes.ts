export const eventTypes = [
  'cleanup',
  'picnic',
  'other',
] as const;

export type EventType = (typeof eventTypes)[number];