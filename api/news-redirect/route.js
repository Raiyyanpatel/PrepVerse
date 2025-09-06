import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

function isValidHttpUrl(u) {
  try {
    const url = new URL(u);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

function searchUrl(title, source) {
  const q = `${title || ""} ${source || ""}`.trim();
  return `https://news.google.com/search?q=${encodeURIComponent(q)}&hl=en-US&gl=US&ceid=US:en`;
}

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const title = searchParams.get("title") || "Latest tech";
  const source = searchParams.get("source") || "";
  const link = searchParams.get("link") || "";

  const fallback = searchUrl(title, source);

  // If link missing or invalid, go straight to search
  if (!isValidHttpUrl(link)) {
    return NextResponse.redirect(fallback, { status: 302 });
  }

  try {
    // Try a quick HEAD (or GET if HEAD not allowed) to avoid redirecting to 404
    let res = await fetch(link, { method: "HEAD", redirect: "follow" });
    if (!res.ok) {
      // Some sites block HEAD; try a lightweight GET without caching
      res = await fetch(link, { method: "GET", redirect: "follow", cache: "no-store" });
    }
    if (res.ok) {
      return NextResponse.redirect(link, { status: 302 });
    }
  } catch (e) {
    // ignore and fall back
  }
  return NextResponse.redirect(fallback, { status: 302 });
}
