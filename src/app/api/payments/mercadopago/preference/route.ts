import { NextRequest, NextResponse } from 'next/server';
import { MercadoPagoConfig, Preference } from 'mercadopago';
import { getAdminDb, verifyIdToken } from '@/lib/firebase-admin';

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }
    const token = authHeader.slice(7);

    let decodedToken;
    try {
      decodedToken = await verifyIdToken(token);
    } catch {
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 });
    }
    const uid = decodedToken.uid;

    const body = await request.json();
    const { enrollmentId } = body;
    if (!enrollmentId) {
      return NextResponse.json({ error: 'enrollmentId es requerido' }, { status: 400 });
    }

    const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
    if (!accessToken) {
      return NextResponse.json({ error: 'Mercado Pago no configurado' }, { status: 500 });
    }

    const adminDb = getAdminDb();
    const enrollmentSnap = await adminDb.collection('enrollments').doc(enrollmentId).get();
    if (!enrollmentSnap.exists) {
      return NextResponse.json({ error: 'Inscripción no encontrada' }, { status: 404 });
    }
    const enrollment = enrollmentSnap.data();
    const studentId = enrollment?.studentId;

    if (!studentId) {
      return NextResponse.json({ error: 'Inscripción inválida' }, { status: 400 });
    }

    const userSnap = await adminDb.collection('users').doc(uid).get();
    const userRole = userSnap.data()?.role;
    const isStudent = studentId === uid;
    const isAdmin = userRole === 'admin';
    if (!isStudent && !isAdmin) {
      return NextResponse.json({ error: 'No tienes permiso para pagar esta inscripción' }, { status: 403 });
    }

    const workshopSnap = await adminDb.collection('workshops').doc(enrollment.workshopId).get();
    const workshop = workshopSnap.data();
    const amount = workshop?.price ?? 0;

    const client = new MercadoPagoConfig({
      accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN || '',
    });
    const preference = new Preference(client);
    const result = await preference.create({
      body: {
        items: [
          {
            id: enrollment.workshopId || 'workshop',
            title: workshop?.title ?? 'Taller',
            quantity: 1,
            unit_price: amount,
            currency_id: 'ARS',
          },
        ],
        external_reference: enrollmentId,
        notification_url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://example.com'}/api/payments/mercadopago/webhook`,
        metadata: {
          enrollmentId,
          studentId,
          workshopId: enrollment.workshopId,
          sessionId: enrollment.sessionId,
        },
      },
    });

    const initPoint = result.init_point;
    const preferenceId = result.id;

    await adminDb.collection('payments').add({
      enrollmentId,
      studentId,
      teacherId: enrollment.teacherId,
      workshopId: enrollment.workshopId,
      sessionId: enrollment.sessionId,
      provider: 'mercadopago',
      amount,
      currency: 'ARS',
      status: 'created',
      preferenceId: preferenceId || undefined,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return NextResponse.json({
      initPoint,
      preferenceId,
    });
  } catch (err: unknown) {
    console.error('Error creating MP preference:', err);
    const message = err instanceof Error ? err.message : 'Error al crear preferencia';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
