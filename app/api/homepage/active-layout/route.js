import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getActiveLayout, setActiveLayout, getAvailableLayouts } from '@/lib/layout-manager';

export const dynamic = 'force-dynamic';

export async function GET() {
  const layoutId = await getActiveLayout();
  const layouts = getAvailableLayouts();
  return NextResponse.json({ layoutId, layouts });
}

export async function POST(request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { layoutId } = await request.json();
  if (!layoutId) {
    return NextResponse.json({ error: 'Missing layoutId' }, { status: 400 });
  }

  try {
    await setActiveLayout(layoutId);
    return NextResponse.json({ success: true, layoutId });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
