import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!
)

// 🔹 GET
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const project_id = searchParams.get("project_id")

  const { data, error } = await supabase
    .from("procedures")
    .select("*")
    .eq("project_id", project_id)
    .order("order_index", { ascending: true })

  if (error) return NextResponse.json({ error }, { status: 500 })
  return NextResponse.json({ data })
}

// 🔹 POST
export async function POST(req: Request) {
  const body = await req.json()
  const { project_id, title } = body

  const { data: existing } = await supabase
    .from("procedures")
    .select("*")
    .eq("project_id", project_id)

  const order_index = existing ? existing.length + 1 : 1

  const { data, error } = await supabase
    .from("procedures")
    .insert([{ project_id, title, order_index }])
    .select()

  if (error) return NextResponse.json({ error }, { status: 500 })
  return NextResponse.json({ data })
}

// 🔹 DELETE + 자동 재정렬
export async function DELETE(req: Request) {
  const body = await req.json()
  const { id, project_id } = body

  await supabase.from("procedures").delete().eq("id", id)

  // 다시 정렬
  const { data } = await supabase
    .from("procedures")
    .select("*")
    .eq("project_id", project_id)
    .order("order_index", { ascending: true })

  if (data) {
    for (let i = 0; i < data.length; i++) {
      await supabase
        .from("procedures")
        .update({ order_index: i + 1 })
        .eq("id", data[i].id)
    }
  }

  return NextResponse.json({ message: "deleted" })
}
