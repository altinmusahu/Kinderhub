import { NextRequest, NextResponse } from 'next/server';
import { getUsers, addUser } from '@/lib/db';

export async function GET() {
  const users = await getUsers();
  return NextResponse.json(users);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const user = await addUser(body);
  return NextResponse.json(user, { status: 201 });
}