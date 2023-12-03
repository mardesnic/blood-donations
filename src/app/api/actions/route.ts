import { NextRequest, NextResponse } from 'next/server';
import ActionService from './service';

export async function GET() {
  const actions = await ActionService.find();
  return NextResponse.json(actions);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const newAction = await ActionService.create(body);
  return NextResponse.json(newAction);
}
