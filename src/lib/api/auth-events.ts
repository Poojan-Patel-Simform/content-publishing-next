type Listener = () => void;

const listeners = new Set<Listener>();

export const onSessionExpired = (listener: Listener): (() => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

export const emitSessionExpired = (): void => {
  for (const listener of listeners) listener();
};
