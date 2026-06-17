export type SSECallback = (order: any) => void;
const sseListeners: SSECallback[] = [];

export const addSSEListener = (cb: SSECallback) => {
  sseListeners.push(cb);
  return () => {
    const idx = sseListeners.indexOf(cb);
    if (idx !== -1) sseListeners.splice(idx, 1);
  };
};

export const emitNewOrder = (order: any) => {
  sseListeners.forEach(cb => cb(order));
};
