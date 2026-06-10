import prisma from './prisma';

export async function generateQueueNumber() {
  const today = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const prefix = `#SBK-${today}-`;

  const latest = await prisma.order.findFirst({
    where: { orderNumber: { startsWith: prefix } },
    orderBy: { createdAt: 'desc' },
  });

  let seq = 1;
  if (latest) {
    const lastSeq = parseInt(latest.orderNumber.split('-').pop() || '0', 10);
    seq = lastSeq + 1;
  }

  const padded = String(seq).padStart(3, '0');
  return `${prefix}${padded}`;
}
