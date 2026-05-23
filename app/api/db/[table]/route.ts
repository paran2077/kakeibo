import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ table: string }> }
) {
  const { table } = await params
  const { searchParams } = request.nextUrl
  const method = searchParams.get('_m') || 'POST'
  const body = JSON.parse(searchParams.get('_d') || '{}')
  const supabase = getSupabase()

  if (method === 'POST') {
    const { error } = await supabase.from(table).insert(body)
    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  } else if (method === 'PATCH') {
    const { id, ...rest } = body
    const { error } = await supabase.from(table).update(rest).eq('id', id)
    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  } else if (method === 'DELETE') {
    const { error } = await supabase.from(table).delete().eq('id', body.id)
    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return new NextResponse(null, { status: 204 })
}
