import { NextResponse } from 'next/server';
import { requireTrueAdmin } from '../../../../lib/api';
import { listEventRequests } from '../../../../lib/content-service';

export async function GET() {
  const { error } = await requireTrueAdmin();
  if (error) {
    return error;
  }

  const items = await listEventRequests();
  return NextResponse.json(items);
}
