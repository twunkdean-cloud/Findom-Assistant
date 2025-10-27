import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, serviceRoleKey);

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Require Authorization header and verify JWT
  const authHeader = req.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
  const token = authHeader.replace('Bearer ', '');
  const { data: userData, error: userError } = await supabase.auth.getUser(token);
  if (userError || !userData?.user) {
    return new Response(JSON.stringify({ error: 'Invalid token' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }

  try {
    let requestBody;
    try {
      const text = await req.text();
      requestBody = JSON.parse(text);
    } catch (_parseError) {
      return new Response(JSON.stringify({ error: 'Invalid JSON in request body' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const { prompt, systemInstruction } = requestBody;

    if (!prompt) {
      return new Response(JSON.stringify({ error: 'Prompt is required' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const apiKey = Deno.env.get('GEMINI_API_KEY');
    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'API key not configured' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const modelNames = ['gemini-2.0-flash-exp', 'gemini-2.0-flash', 'gemini-1.5-flash', 'gemini-pro'];
    let response: Response | undefined;
    let lastError: any;

    for (const modelName of modelNames) {
      try {
        const modelEndpoint = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;

        const geminiRequestBody: any = {
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.7, topK: 40, topP: 0.95, maxOutputTokens: 2048 },
        };

        if (systemInstruction) {
          geminiRequestBody.systemInstruction = { parts: [{ text: systemInstruction }] };
        }

        response = await fetch(modelEndpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(geminiRequestBody),
        });

        if (response.ok) {
          break;
        } else {
          lastError = await response.json();
        }
      } catch (err: any) {
        lastError = { error: err?.message || 'Unknown error' };
      }
    }

    if (!response || !response.ok) {
      return new Response(JSON.stringify({ error: `All models failed. Last error: ${lastError?.error?.message || lastError?.error || 'Unknown error'}` }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const data = await response.json();

    let generatedText = '';
    if (data.candidates && data.candidates.length > 0) {
      const candidate = data.candidates[0];
      if (candidate.content && candidate.content.parts && candidate.content.parts.length > 0) {
        generatedText = candidate.content.parts[0].text;
      }
    } else if (data.text) {
      generatedText = data.text;
    }

    if (!generatedText) {
      return new Response(JSON.stringify({ error: 'No response generated from Gemini API' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    return new Response(JSON.stringify({ response: generatedText }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: `Server error: ${error.message}` }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});