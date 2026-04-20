import crypto from 'crypto';
import type { NextRequest } from 'next/server';

function parseSignatureHeader(signature: string | null): { ts: string; v1: string } | null {
  if (!signature) return null;
  const map: Record<string, string> = {};
  for (const part of signature.split(',')) {
    const trimmed = part.trim();
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const value = trimmed.slice(eq + 1).trim();
    map[key] = value;
  }
  if (!map.ts || !map.v1) return null;
  return { ts: map.ts, v1: map.v1 };
}

/**
 * Valida notificación de Mercado Pago con `x-signature` y `MERCADOPAGO_WEBHOOK_SECRET`.
 * @see https://www.mercadopago.com.ar/developers/es/docs/your-integrations/notifications/webhooks
 */
export function isMercadoPagoWebhookAuthenticated(
  request: NextRequest,
  body: { data?: { id?: unknown } }
): boolean {
  const secret = process.env.MERCADOPAGO_WEBHOOK_SECRET;
  const isProd = process.env.NODE_ENV === 'production';

  if (!secret) {
    if (isProd) {
      console.error('MERCADOPAGO_WEBHOOK_SECRET es obligatorio en producción');
      return false;
    }
    console.warn('MERCADOPAGO_WEBHOOK_SECRET no definido: se omite validación (solo desarrollo)');
    return true;
  }

  const paymentId = body.data?.id != null ? String(body.data.id) : '';
  const requestId = request.headers.get('x-request-id') ?? '';
  const signatureHeader = request.headers.get('x-signature');
  const parsed = parseSignatureHeader(signatureHeader);

  if (!parsed || !paymentId || !requestId) {
    return false;
  }

  const manifest = `id:${paymentId};request-id:${requestId};ts:${parsed.ts};`;
  const expectedHex = crypto.createHmac('sha256', secret).update(manifest).digest('hex');

  try {
    const a = Buffer.from(parsed.v1, 'hex');
    const b = Buffer.from(expectedHex, 'hex');
    if (a.length !== b.length) return false;
    return crypto.timingSafeEqual(a, b);
  } catch {
    return false;
  }
}
