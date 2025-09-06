import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Disable any caching for this endpoint so it refreshes every page load
export const dynamic = "force-dynamic";

// Simple in-memory daily cache (resets on server restart)
let dailyCache = { key: null, data: null };

function extractJson(text) {
  // Try to extract JSON from fenced code blocks or plain text
  try {
    return JSON.parse(text);
  } catch {
    const match = text.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
    if (match) {
      try {
        return JSON.parse(match[0]);
      } catch {
        return null;
      }
    }
    return null;
  }
}

function isValidHttpUrl(u) {
  try {
    const url = new URL(u);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

export async function GET(req) {
  try {
    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { items: [], error: "Missing NEXT_PUBLIC_GEMINI_API_KEY" },
        { status: 500, headers: { "Cache-Control": "no-store" } }
      );
    }

  const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  const now = new Date();
  const dayKey = now.toISOString().slice(0, 10);
  const url = new URL(req.url);
  const force = url.searchParams.get('force');
  const bypassCache = force === '1' || force === 'true';

  // Serve cached payload for the current day
  if (!bypassCache && dailyCache.key === dayKey && dailyCache.data) {
    return NextResponse.json(dailyCache.data, {
      headers: { "Cache-Control": "no-store" },
    });
  }

  const prompt = `You are TechPulse, a concise technology reporter.
Return STRICT JSON with shape: { "items": [ { "title": string, "summary": string, "tag": string, "source": string, "link": string } ] }.
Rules:
- 6 short items, latest or trending in the last 14 days across AI, cloud, web/mobile, OSS, security, infra, or chips. Today is ${now.toUTCString()}.
- Keep results consistent for the day; do not inject randomness across calls on the same day.
- Each summary <= 28 words, neutral and factual.
- tag is one of: AI, Cloud, Web, Mobile, OSS, Infra, Chips, Security.
- source is the publication or org name. link is a plausible, clean https URL if known; else an empty string.
Output only JSON.`;

  const result = await model.generateContent({ contents: [{ role: "user", parts: [{ text: prompt }] }], generationConfig: { temperature: 0.7 } });
    const text = result?.response?.text?.() ?? (await result.response.text());

    const json = extractJson(text);
  const items = Array.isArray(json?.items) ? json.items : [];

    // Basic sanitization and fallback if model misbehaves
    const safeItems = items
      .filter((it) => it && typeof it.title === "string")
      .map((it) => ({
        title: String(it.title).slice(0, 120),
        summary: String(it.summary || "Latest development in technology.").slice(0, 220),
        tag: String(it.tag || "Tech"),
        source: String(it.source || ""),
        link: isValidHttpUrl(it.link) ? String(it.link) : "",
        // Always provide a reliable search fallback
        search: (function(title, source) {
          const q = `${title} ${source || ""}`.trim();
          return `https://news.google.com/search?q=${encodeURIComponent(q)}&hl=en-US&gl=US&ceid=US:en`;
        })(String(it.title), String(it.source || "")),
      }));

    // Shuffle to ensure different order even with similar content
    for (let i = safeItems.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [safeItems[i], safeItems[j]] = [safeItems[j], safeItems[i]];
    }

    const payload = { items: safeItems.slice(0, 4), ts: now.toISOString(), dayKey };
  dailyCache = { key: dayKey, data: payload };

    return NextResponse.json(payload, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (err) {
    return NextResponse.json(
      { items: [], error: String(err?.message || err) },
      { status: 500, headers: { "Cache-Control": "no-store" } }
    );
  }
}
