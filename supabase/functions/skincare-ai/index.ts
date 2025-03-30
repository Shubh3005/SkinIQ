
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { ChatCompletionMessageParam } from 'https://cdn.skypack.dev/openai@4.28.0?dts';

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

if (!openAIApiKey) {
  console.error('Missing OpenAI API key');
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, userSkinType, userSkinTone, history } = await req.json();

    console.log('Processing message:', message);
    console.log('User skin type:', userSkinType);
    console.log('User skin tone:', userSkinTone);

    // Create a conversation history for the AI
    let messages: ChatCompletionMessageParam[] = [];

    // System message with additional context about user's skin profile
    let systemPrompt = `You are a dermatology assistant specialized in skincare. 
    Provide personalized advice about skincare routines, products, and practices.
    Be compassionate, accurate, and clear. Use simple language and avoid jargon.`;

    // Add skin profile information if available
    if (userSkinType || userSkinTone) {
      systemPrompt += `\n\nImportant user context: `;
      
      if (userSkinType) {
        systemPrompt += `The user has ${userSkinType} skin. `;
      }
      
      if (userSkinTone) {
        systemPrompt += `The user has ${userSkinTone} skin tone. `;
      }
      
      systemPrompt += `\n\nMake sure your recommendations are tailored specifically for these skin characteristics.`;
    } else {
      systemPrompt += `\n\nThe user has not provided their skin type or tone yet. You might want to ask about it to provide more personalized advice.`;
    }

    messages.push({ role: 'system', content: systemPrompt });

    // Add conversation history if provided
    if (history && Array.isArray(history)) {
      messages = [...messages, ...history];
    }

    // Add the current user message
    messages.push({ role: 'user', content: message });

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages,
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    const data = await response.json();

    if (data.error) {
      throw new Error(data.error.message);
    }

    return new Response(
      JSON.stringify({ message: data.choices[0].message.content }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error:', error.message);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
