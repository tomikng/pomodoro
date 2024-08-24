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

    console.log('Attempting to register user:', email)

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    })

    if (error) {
      console.error('Supabase error:', error)

      if (error.message.includes('rate limit')) {
        return NextResponse.json(
          {
            error: 'Too many registration attempts. Please try again later.',
            isRateLimit: true,
          },
          { status: 429 }
        )
      }

      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    if (data) {
      console.log('User registered successfully:', data.user)
      return NextResponse.json({ user: data.user }, { status: 201 })
    }

    console.error('Registration failed without error')
    return NextResponse.json({ error: 'Registration failed' }, { status: 400 })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}
