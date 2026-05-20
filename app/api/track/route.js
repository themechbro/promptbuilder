import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const body = await req.json();
    
    // 1. Parse headers natively
    const ip = req.headers.get('x-forwarded-for') || 
               req.headers.get('x-real-ip') || 
               '127.0.0.1';

    const { device, referrer, duration } = body;

    // 2. Direct HTTPS REST Execution to Supabase Rest API Endpoint
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    const response = await fetch(`${supabaseUrl}/rest/v1/analytics_logs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Prefer': 'return=minimal' // Minimal overhead, just insert and forget
      },
      body: JSON.stringify({
        ip_address: ip.split(',')[0].trim(),
        device: device || 'Unknown',
        referrer: referrer || 'Direct',
        duration_seconds: parseInt(duration, 10) || 0
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Supabase REST Error: ${errorText}`);
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err) {
    console.error('Analytics tracking execution error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}