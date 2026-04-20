import { NextRequest, NextResponse } from 'next/server';
import { MercadoPagoConfig, Payment } from 'mercadopago';
import { getAdminDb } from '@/lib/firebase-admin';
import { isMercadoPagoWebhookAuthenticated } from '@/lib/mercadopago-webhook';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!isMercadoPagoWebhookAuthenticated(request, body)) {
      return NextResponse.json({ error: 'Firma inválida' }, { status: 401 });
    }

    const type = body.type;
    const paymentId = body.data?.id;

    if (type !== 'payment' || !paymentId) {
      return NextResponse.json({ ok: true, message: 'Ignored' });
    }

    const client = new MercadoPagoConfig({
      accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN || '',
    });
    const mpPayment = new Payment(client);
    const paymentDetails = await mpPayment.get({ id: paymentId });

    const status = paymentDetails.status;
    const externalRef = paymentDetails.external_reference || paymentDetails.metadata?.enrollmentId;
    const enrollmentId = externalRef;

    if (!enrollmentId) {
      return NextResponse.json({ ok: true, message: 'No enrollment ref' });
    }

    const adminDb = getAdminDb();

    const paymentsSnap = await adminDb
      .collection('payments')
      .where('enrollmentId', '==', enrollmentId)
      .limit(5)
      .get();

    if (!paymentsSnap.empty) {
      const paymentDoc = paymentsSnap.docs[0];
      const paymentData = paymentDoc.data();

      if (paymentData.status === 'approved') {
        return NextResponse.json({ ok: true, message: 'Already processed' });
      }

      const approved = status === 'approved';
      await paymentDoc.ref.update({
        status: approved ? 'approved' : status,
        mpPaymentId: paymentId,
        updatedAt: new Date(),
      });

      if (approved) {
        await adminDb.collection('enrollments').doc(String(enrollmentId)).update({
          status: 'paid',
          updatedAt: new Date(),
        });
      }
    }

    return NextResponse.json({ ok: true });
  } catch (err: unknown) {
    console.error('Webhook error:', err);
    const message = err instanceof Error ? err.message : 'Error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
