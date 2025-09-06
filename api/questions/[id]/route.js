import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

export const dynamic = "force-dynamic";

export async function GET(_req, { params }) {
  try {
    const DB_URL = process.env.NEXT_PUBLIC_DRIZZLE_DB_URL;
    const id = Number(params?.id);
    if (!DB_URL) return NextResponse.json({ error: "Missing DB URL" }, { status: 500 });
    if (!Number.isFinite(id)) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

    const sql = neon(DB_URL);
    const rows = await sql`
      SELECT question_id, title, description, difficulty, "constraints", example_input, example_output
      FROM questions WHERE question_id = ${id} LIMIT 1
    `;
    if (!rows.length) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(rows[0], { headers: { "Cache-Control": "no-store" } });
  } catch (e) {
    return NextResponse.json({ error: String(e?.message || e) }, { status: 500 });
  }
}
