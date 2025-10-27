import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    let requestBody;
    try {
      const text = await req.text();
      console.log('Raw request body:', text);
      requestBody = JSON.parse(text);
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      return new Response(
        JSON.stringify({ error: 'Invalid JSON in request body' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Parsed request body:', requestBody);
    console.log('Request body keys:', Object.keys(requestBody));

    const { prompt, systemInstruction } = requestBody;

    if (!prompt) {
      console.error('Prompt is missing. Available keys:', Object.keys(requestBody));
      return new Response(
        JSON.stringify({ 
          error: 'Prompt is required',
          debug: {
            receivedKeys: Object.keys(requestBody),
            hasPrompt: 'prompt' in requestBody,
            promptValue: prompt,
            fullBody: requestBody
          }
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const apiKey = Deno.env.get('GEMINI_API_KEY');
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: 'API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Try different model names in order of preference
    const modelNames = ['gemini-2.0-flash-exp', 'gemini-2.0-flash', 'gemini-1.5-flash', 'gemini-pro'];
    let response;
    let lastError;
    
    for (const modelName of modelNames) {
      try {
        const modelEndpoint = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;
        
        const geminiRequestBody: any = {
          contents: [{
            parts: [{
              text: prompt
            }]
          }],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 2048,
          },
        };

        // Add system instruction if provided
        if (systemInstruction) {
          geminiRequestBody.systemInstruction = {
            parts: [{
              text: systemInstruction
            }]
          };
        }

        response = await fetch(modelEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(geminiRequestBody),
        });
        
        if (response.ok) {
          console.log(`Successfully used model: ${modelName}`);
          break; // Success, exit loop
        } else {
          lastError = await response.json();
          console.log(`Model ${modelName} failed:`, lastError);
        }
      } catch (err) {
        lastError = { error: err.message };
        console.log(`Model ${modelName} error:`, err);
      }
    }
    
    if (!response || !response.ok) {
      return new Response(
        JSON.stringify({ 
          error: `All models failed. Last error: ${lastError?.error?.message || lastError?.error || 'Unknown error'}`
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    console.log('Gemini API response:', JSON.stringify(data, null, 2));
    
    // Handle different response formats
    let generatedText = '';
    if (data.candidates && data.candidates.length > 0) {
      const candidate = data.candidates[0];
      if (candidate.content && candidate.content.parts && candidate.content.parts.length > 0) {
        generatedText = candidate.content.parts[0].text;
      }
    } else if (data.text) {
      // Some models return text directly
      generatedText = data.text;
    }
    
    if (!generatedText) {
      console.error('No text found in response:', data);
      return new Response(
        JSON.stringify({ error: 'No response generated from Gemini API', debug: data }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ response: generatedText }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Edge function error:', error);
    return new Response(
      JSON.stringify({ error: `Server error: ${error.message}` }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});