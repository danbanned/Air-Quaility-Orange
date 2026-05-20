import path from 'path';
import { mkdir, writeFile } from 'fs/promises';
import { NextResponse } from 'next/server';
import { requireAdminAccess } from '@/lib/api';
import { logActivity } from '@/lib/admin-system';
import { prisma } from '@/lib/prisma';

const modelMap = {
  event: prisma.event,
  solution: prisma.solution,
  opportunity: prisma.opportunity,
  story: prisma.story,
  'hero-slide': prisma.heroSlide,
};

export async function POST(request) {
  const { session, error } = await requireAdminAccess();
  if (error) {
    return error;
  }

  const formData = await request.formData();
  const file = formData.get('image');
  const itemId = formData.get('itemId');
  const type = formData.get('type');

  if (!file || typeof file.arrayBuffer !== 'function') {
    return NextResponse.json({ error: 'No image provided' }, { status: 400 });
  }

  if (!itemId || !type || !modelMap[type]) {
    return NextResponse.json({ error: 'Invalid upload target' }, { status: 400 });
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const filename = `${Date.now()}-${String(file.name || 'upload').replace(/[^a-zA-Z0-9.-]/g, '')}`;
  const uploadDir = path.join(process.cwd(), 'public', 'uploads');

  await mkdir(uploadDir, { recursive: true });
  await writeFile(path.join(uploadDir, filename), buffer);

  const imageUrl = `/uploads/${filename}`;

  await modelMap[type].update({
    where: { id: String(itemId) },
    data: { imageUrl },
  });

  await logActivity({
    action: 'UPDATE',
    entityType: String(type).toUpperCase(),
    entityId: String(itemId),
    userId: session.user.id,
    details: { imageUrl },
  });

  return NextResponse.json({ imageUrl });
}
