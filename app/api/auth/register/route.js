import { NextResponse } from 'next/server';
import { hashPassword, normalizeEmail } from '../../../../lib/admin-system';
import { prisma } from '../../../../lib/prisma';

export async function POST(request) {
  const payload = await request.json().catch(() => null);

  if (!payload?.email || !payload?.password) {
    return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
  }

  const email = normalizeEmail(payload.email);
  const existing = await prisma.user.findUnique({ where: { email } });

  if (existing) {
    return NextResponse.json({ error: 'Account already exists' }, { status: 409 });
  }

  const user = await prisma.user.create({
    data: {
      email,
      password: await hashPassword(payload.password),
      name: payload.name?.trim() || null,
      contactInfo: payload.contactInfo?.trim() || null,
      role: 'USER',
    },
    select: {
      id: true,
      email: true,
      role: true,
      name: true,
      contactInfo: true,
    },
  });

  return NextResponse.json(user, { status: 201 });
}
