import { NextRequest, NextResponse } from 'next/server';
// import { getUserById, updateUser, deleteUser } from '@/lib/db';

// export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
//   const { id } = await params;
//   const user = await getUserById(Number(id));
//   if (!user) return NextResponse.json({ error: 'Not found' }, { status: 404 });
//   return NextResponse.json(user);
// }

// export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
//   const { id } = await params;
//   const body = await request.json();
//   const user = await updateUser(Number(id), body);
//   if (!user) return NextResponse.json({ error: 'Not found' }, { status: 404 });
//   return NextResponse.json(user);
// }

// export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
//   const { id } = await params;
//   const deleted = await deleteUser(Number(id));
//   if (!deleted) return NextResponse.json({ error: 'Not found' }, { status: 404 });
//   return new NextResponse(null, { status: 204 });
// }