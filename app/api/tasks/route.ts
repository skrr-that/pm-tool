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

export async function GET(req: Request) {
  try {
    const supabase = getSupabase()

    const { searchParams } = new URL(req.url)
    const procedure_id = searchParams.get("procedure_id")

    if (!procedure_id) {
      return NextResponse.json(
        { error: "procedure_id missing" },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from("tasks")
      .select("*")
      .eq("procedure_id", procedure_id)

    if (error) {
      console.log("TASK SELECT ERROR:", error)
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ data })
  } catch (err: any) {
    console.log("TASK GET CATCH ERROR:", err)
    return NextResponse.json(
      { error: err.message || "Server error" },
      { status: 500 }
    )
  }
}

export async function POST(req: Request) {
  try {
    const supabase = getSupabase()

    const body = await req.json()
    const { procedure_id, title } = body

    // 필수값 체크
    if (!procedure_id || !title) {
      console.log("ERROR: missing values", body)
      return NextResponse.json(
        { error: "Missing procedure_id or title" },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from("tasks")
      .insert([
        {
          procedure_id,
          title,
          created_at: new Date().toISOString(),
        },
      ])
      .select()

    if (error) {
      console.log("TASK INSERT ERROR:", error)
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ data })
  } catch (err: any) {
    console.log("TASK POST CATCH ERROR:", err)
    return NextResponse.json(
      { error: err.message || "Server error" },
      { status: 500 }
    )
  }
}
