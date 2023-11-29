import { NextResponse } from 'next/server';
import ActionService from './service';

export async function GET() {
  const actions = await ActionService.find();
  return NextResponse.json(actions);
}
