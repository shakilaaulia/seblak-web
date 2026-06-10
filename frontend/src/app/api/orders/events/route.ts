import { addSSEListener } from '@/lib/store';

export async function GET() {
  const encoder = new TextEncoder();
  let cleanup: (() => void) | undefined;
  let keepAlive: NodeJS.Timeout | undefined;

  const stream = new ReadableStream({
    start(controller) {
      try {
        controller.enqueue(encoder.encode('retry: 3000\n\n'));
      } catch (e) {
        // stream already closed
      }

      cleanup = addSSEListener((order) => {
        const data = JSON.stringify({
          id: order.id,
          orderNumber: order.orderNumber,
          customerName: order.customerName,
          totalPrice: order.totalPrice,
          status: order.status,
        });
        try {
          controller.enqueue(encoder.encode(`event: new-order\ndata: ${data}\n\n`));
        } catch (e) {
          // stream already closed
        }
      });

      // Keep connection alive
      keepAlive = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(': keepalive\n\n'));
        } catch (e) {
          // stream already closed
          if (keepAlive) clearInterval(keepAlive);
        }
      }, 15000);
    },
    cancel() {
      if (cleanup) cleanup();
      if (keepAlive) clearInterval(keepAlive);
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}
