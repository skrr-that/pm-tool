import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!
)

// ✅ 아이디어 추가 (POST)
export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { project_id, user_name, title, description } = body

    // 입력값 로그 확인
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
    const { data, error } = await supabase
      .from("ideas")
      .select("*")

    if (error) {
      console.log("SUPABASE SELECT ERROR:", error)
      return NextResponse.json(
        { error: error },
        { status: 500 }
      )
    }

    return NextResponse.json({ data })
  } catch (err: any) {
    console.log("SERVER ERROR:", err)
    return NextResponse.json(
      { error: err.message || err },
      { status: 500 }
    )
  }
}
