import { addSSEListener } from '@/lib/store';

export async function GET() {
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    start(controller) {
      controller.enqueue(encoder.encode('retry: 3000\n\n'));

      const cleanup = addSSEListener((order) => {
        const data = JSON.stringify({
          id: order.id,
          orderNumber: order.orderNumber,
          customerName: order.customerName,
          totalPrice: order.totalPrice,
          status: order.status,
        });
        controller.enqueue(encoder.encode(`event: new-order\ndata: ${data}\n\n`));
      });

      // Keep connection alive
      const keepAlive = setInterval(() => {
        controller.enqueue(encoder.encode(': keepalive\n\n'));
      }, 15000);

      // Cleanup on cancel
      (controller as any)._cleanup = () => {
        cleanup();
        clearInterval(keepAlive);
      };
    },
    cancel() {
      if ((this as any)._cleanup) (this as any)._cleanup();
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
