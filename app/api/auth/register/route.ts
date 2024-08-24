// app/api/auth/register/route.ts
import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json()

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    })

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    if (data) {
      return NextResponse.json({ user: data.user }, { status: 201 })
    }

    return NextResponse.json({ error: 'Registration failed' }, { status: 400 })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}
