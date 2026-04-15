import { createClient } from "@supabase/supabase-js"
export const runtime = "nodejs"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    console.log("Incoming body:", body)

    const { userId } = body

    if (!userId) {
      return new Response(JSON.stringify({ error: "Missing userId" }), { status: 400 })
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // 1. Delete relational data
    const { error: rpcError } = await supabase.rpc("delete_user_data", {
      p_user_id: userId,
    })

    if (rpcError) {
      console.error("RPC ERROR:", rpcError)
      return new Response(JSON.stringify({ error: rpcError.message }), { status: 500 })
    }

    // 2. Delete auth user
    const { error: deleteError } = await supabase.auth.admin.deleteUser(userId)

    if (deleteError) {
      console.error("AUTH DELETE ERROR:", deleteError)
      return new Response(JSON.stringify({ error: deleteError.message }), { status: 500 })
    }

    return new Response(JSON.stringify({ success: true }))
  } catch (err: any) {
    console.error("UNCAUGHT ERROR:", err)
    return new Response(JSON.stringify({ error: err.message }), { status: 500 })
  }
}