import { NextResponse } from 'next/server';

const ADMIN_PIN = '123456';

export async function POST(req: Request) {
  try {
    const { pin } = await req.json();
    if (pin === ADMIN_PIN) {
      const res = NextResponse.json({ authenticated: true });
      res.cookies.set('admin_session', 'true', {
        httpOnly: true,
        secure: false,
        sameSite: 'lax',
        maxAge: 60 * 60 * 8,
        path: '/',
      });
      return res;
    }
    return NextResponse.json({ authenticated: false, message: 'PIN salah' }, { status: 401 });
  } catch {
    return NextResponse.json({ message: 'Invalid request' }, { status: 400 });
  }
}
