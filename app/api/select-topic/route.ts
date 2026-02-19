import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!
)

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { project_id, title, description } = body

    // 1️⃣ 기존 대주제 삭제
    await supabase
      .from("select-topic")
      .delete()
      .eq("project_id", project_id)

    // 2️⃣ 새 대주제 추가
    const { data, error } = await supabase
      .from("select-topic")
      .insert([
        {
          project_id,
          title,
          description,
        },
      ])
      .select()

    if (error) {
      console.log("SELECT_TOPIC_ERROR:", error)
      return NextResponse.json({ error }, { status: 500 })
    }

    return NextResponse.json({ data })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

