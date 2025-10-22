import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const allowedOrigin = Deno.env.get("ALLOWED_ORIGIN") ?? "*";
const corsHeaders: Record<string, string> = {
  "Access-Control-Allow-Origin": allowedOrigin,
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get("GEMINI_API_KEY");
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "Server misconfiguration: GEMINI_API_KEY not set." }), {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const contentType = req.headers.get("Content-Type") || "";
    if (!contentType.includes("application/json")) {
      return new Response(JSON.stringify({ error: "Invalid request: expected application/json." }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const body = await req.json();
    const { prompt, imageData, imageMimeType } = body || {};
    if (!prompt || !imageData || !imageMimeType) {
      return new Response(JSON.stringify({ error: "Missing fields: prompt, imageData, and imageMimeType are required." }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Optional: basic size guard (base64 estimate)
    if (typeof imageData === "string" && imageData.length > 7_000_000) {
      return new Response(JSON.stringify({ error: "Image too large. Please upload a smaller image." }), {
        status: 413,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`;

    const geminiPayload = {
      contents: [
        {
          parts: [
            { text: prompt },
            {
              inline_data: {
                mime_type: imageMimeType,
                data: imageData,
              },
            },
          ],
        },
      ],
    };

    const geminiRes = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(geminiPayload),
    });

    if (!geminiRes.ok) {
      const err = await geminiRes.text();
      return new Response(JSON.stringify({ error: `Gemini error: ${err || geminiRes.status}` }), {
        status: 502,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const geminiJson = await geminiRes.json();

    // Extract first text result safely
    let description = "No description generated.";
    try {
      const candidates = geminiJson?.candidates ?? [];
      const firstCandidate = candidates[0];
      const parts = firstCandidate?.content?.parts ?? [];
      const firstTextPart = parts.find((p: any) => typeof p?.text === "string");
      description = firstTextPart?.text ?? description;
    } catch (_e) {
      // leave default description
    }

    return new Response(JSON.stringify({ description }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: (error as Error).message || "Unknown server error." }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
});