import { NextResponse } from 'next/server';
import { addLead, getLeads } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, phone, role, marmoraria_interest } = body;

    if (!name || !email || !phone || !role) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    addLead({ name, email, phone, role, marmoraria_interest });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error adding lead:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const leads = getLeads();
    return NextResponse.json({ leads });
  } catch (error) {
    console.error('Error fetching leads:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
