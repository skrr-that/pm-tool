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

// 🔹 GET
export async function GET(req: Request) {
  try {
    const supabase = getSupabase()

    const { searchParams } = new URL(req.url)
    const project_id = searchParams.get("project_id")

    const { data, error } = await supabase
      .from("procedures")
      .select("*")
      .eq("project_id", project_id)
      .order("order_index", { ascending: true })

    if (error)
      return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ data })
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Server error" },
      { status: 500 }
    )
  }
}

// 🔹 POST
export async function POST(req: Request) {
  try {
    const supabase = getSupabase()

    const body = await req.json()
    const { project_id, title } = body

    const { data: existing, error: fetchError } = await supabase
      .from("procedures")
      .select("*")
      .eq("project_id", project_id)

    if (fetchError)
      return NextResponse.json({ error: fetchError.message }, { status: 500 })

    const order_index = existing ? existing.length + 1 : 1

    const { data, error } = await supabase
      .from("procedures")
      .insert([{ project_id, title, order_index }])
      .select()

    if (error)
      return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ data })
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Server error" },
      { status: 500 }
    )
  }
}

// 🔹 DELETE + 자동 재정렬
export async function DELETE(req: Request) {
  try {
    const supabase = getSupabase()

    const body = await req.json()
    const { id, project_id } = body

    const { error: deleteError } = await supabase
      .from("procedures")
      .delete()
      .eq("id", id)

    if (deleteError)
      return NextResponse.json({ error: deleteError.message }, { status: 500 })

    // 다시 정렬
    const { data, error: fetchError } = await supabase
      .from("procedures")
      .select("*")
      .eq("project_id", project_id)
      .order("order_index", { ascending: true })

    if (fetchError)
      return NextResponse.json({ error: fetchError.message }, { status: 500 })

    if (data) {
      for (let i = 0; i < data.length; i++) {
        await supabase
          .from("procedures")
          .update({ order_index: i + 1 })
          .eq("id", data[i].id)
      }
    }

    return NextResponse.json({ message: "deleted" })
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Server error" },
      { status: 500 }
    )
  }
}
