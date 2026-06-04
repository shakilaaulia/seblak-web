// src/utils/queue.js
/**
 * Generates a daily‑reset sequential queue number.
 * Format: #SBK-YYYYMMDD-XXX (e.g., #SBK-20230604-001)
 */
const prisma = require('../prismaClient');

async function generateQueueNumber() {
  const today = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const prefix = `#SBK-${today}-`;

  const latest = await prisma.order.findFirst({
    where: { queueNumber: { startsWith: prefix } },
    orderBy: { createdAt: 'desc' },
  });

  let seq = 1;
  if (latest) {
    const lastSeq = parseInt(latest.queueNumber.split('-').pop(), 10);
    seq = lastSeq + 1;
  }

  const padded = String(seq).padStart(3, '0');
  return `${prefix}${padded}`;
}

module.exports = { generateQueueNumber };
