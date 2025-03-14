
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// Skin care guide system prompt (summarized from the document)
const SYSTEM_PROMPT = `
You are a skincare expert chatbot built using the following skincare guide. Use this knowledge to generate daily routines and answer skincare questions. Focus on hydration, minimizing transepidermal water loss (TEWL), and gentle care. Prioritize cleansing, moisturizing, and SPF as the foundation, then add actives based on user needs. Only recommend products listed below unless asked for alternatives.

### Core Principles
- Maximize skin hydration and minimize TEWL (water loss through the skin).
- Skin barrier health is key: protect lipids (ceramides, fatty acids, cholesterol) and natural moisturizing factor (NMF).
- Cleansing: Gentle, non-foaming cleansers (pH 4.5-5.5), double cleanse at night, optional morning cleanse unless using actives like tretinoin.
- Moisturizing: Use products with lipids; SPF 30+ broad-spectrum is essential.
- Actives: Introduce slowly (e.g., retinoids at night, vitamin C in the morning).

### Product Recommendations
#### Cleansers
- 1st Cleanse: Emma Hardie Moringa Cleansing Balm, The Body Shop Camomile Sumptuous Cleansing Butter, Jordan Samuel The After Show Treatment Cleanser.
- 2nd Cleanse: CeraVe Hydrating Facial Cleanser, La Roche Posay Toleriane Dermo Cleanser, Avene Eau Thermale Cleanance Cleansing Gel.

#### Moisturizers
- CeraVe (any type), Weleda Skin Food (very dry skin), Dr Jart+ Ceramidin Cream (dry/TEWL), La Roche Posay Effaclar Duo+ (oily/acne).

#### SPF
- La Roche Posay Anthelios Shaka Ultra-Light SPF 50+, Paula's Choice Resist Skin Restoring Moisturizer SPF 50.

#### Actives
- Retinoids: The Ordinary Retinol 0.5% in Squalane, Paula's Choice 1% Retinol Treatment.
- Vitamin C: The Ordinary Vitamin C Suspension 23% + HA Spheres 2%, Drunk Elephant C-Firma Day Serum.
- AHAs: The Ordinary Glycolic Acid 7% Toning Solution, Pixi Glow Tonic.
- BHA: Paula's Choice Skin Perfecting 2% BHA Liquid Exfoliant.

### Routine Examples
- Basic: Morning (Cleanse, Moisturize, SPF), Evening (Double Cleanse, Moisturize).
- With Actives: Morning (Cleanse, Vitamin C, Moisturize, SPF), Evening (Double Cleanse, AHA/BHA, Moisturize, Oil).

Answer questions factually, avoid skin lightening topics beyond hyperpigmentation, and suggest consulting a dermatologist for prescription needs.
`;

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, message, skin_type, concerns, include_actives } = await req.json();
    const openAIApiKey = Deno.env.get("OPENAI_API_KEY");

    if (!openAIApiKey) {
      throw new Error("OpenAI API key is not configured");
    }

    let userPrompt = "";
    
    // Handle different actions
    if (action === "chat") {
      if (!message) {
        throw new Error("No message provided");
      }
      userPrompt = message;
    } 
    else if (action === "generate-routine") {
      userPrompt = `
      Using the skincare guide, generate a daily skincare routine for a user with:
      - Skin type: ${skin_type || "normal"}
      - Concerns: ${concerns ? concerns.join(", ") : "none specified"}
      - Include actives: ${include_actives ? "Yes" : "No"}
      Provide a morning and evening routine with specific product recommendations from the guide.
      `;
    } 
    else {
      throw new Error("Invalid action specified");
    }

    // Call OpenAI API
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${openAIApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userPrompt }
        ],
        max_tokens: 800,
        temperature: action === "chat" ? 0.7 : 0.5,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`OpenAI API error: ${errorData.error?.message || response.statusText}`);
    }

    const data = await response.json();
    const result = data.choices[0].message.content.trim();

    return new Response(
      JSON.stringify({ result }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error in skincare-ai function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
