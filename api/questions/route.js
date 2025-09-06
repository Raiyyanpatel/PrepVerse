import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const DB_URL = process.env.NEXT_PUBLIC_DRIZZLE_DB_URL;
    if (!DB_URL) {
      return NextResponse.json({ items: [], error: "Missing DB URL" }, { status: 500 });
    }
    const sql = neon(DB_URL);
    const rows = await sql`SELECT question_id, title, difficulty FROM questions ORDER BY question_id ASC`;
    return NextResponse.json({ items: rows }, { headers: { "Cache-Control": "no-store" } });
  } catch (e) {
    return NextResponse.json({ items: [], error: String(e?.message || e) }, { status: 500 });
  }
}
