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

export async function POST(req: Request) {
  try {
    const supabase = getSupabase()

    const body = await req.json()
    const { project_id, title, description } = body

    // 1️⃣ 기존 대주제 삭제
    const { error: deleteError } = await supabase
      .from("select-topic")
      .delete()
      .eq("project_id", project_id)

    if (deleteError) {
      return NextResponse.json(
        { error: deleteError.message },
        { status: 500 }
      )
    }

    // 2️⃣ 새 대주제 추가
    const { data, error: insertError } = await supabase
      .from("select-topic")
      .insert([
        {
          project_id,
          title,
          description,
        },
      ])
      .select()

    if (insertError) {
      console.log("SELECT_TOPIC_ERROR:", insertError)
      return NextResponse.json(
        { error: insertError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ data })
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Server error" },
      { status: 500 }
    )
  }
}
