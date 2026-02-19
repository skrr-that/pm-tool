import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

function getSupabase() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SECRET_KEY

  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Supabase environment variables are missing")
  }

  return createClient(supabaseUrl, supabaseKey)
}

// ✅ 아이디어 추가 (POST)
export async function POST(req: Request) {
  try {
    const supabase = getSupabase()

    const body = await req.json()
    const { project_id, user_name, title, description } = body

    console.log("받은 데이터:", body)

    const { data, error } = await supabase
      .from("ideas")
      .insert([
        {
          project_id,
          user_name,
          title,
          description,
        },
      ])
      .select()

    if (error) {
      console.log("INSERT ERROR:", error)
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ data })
  } catch (err: any) {
    console.log("SERVER ERROR:", err)
    return NextResponse.json(
      { error: err.message || "Server error" },
      { status: 500 }
    )
  }
}

// ✅ 아이디어 목록 조회 (GET)
export async function GET() {
  try {
    const supabase = getSupabase()

    const { data, error } = await supabase
      .from("ideas")
      .select("*")

    if (error) {
      console.log("SUPABASE SELECT ERROR:", error)
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ data })
  } catch (err: any) {
    console.log("SERVER ERROR:", err)
    return NextResponse.json(
      { error: err.message || "Server error" },
      { status: 500 }
    )
  }
}
