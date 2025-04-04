
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

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
    // Parse request body
    const { action, data } = await req.json();

    // Get supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    // For analyze-skin, we'll skip authentication to allow anyone to analyze skin
    if (action === 'analyze-skin') {
      console.log('Processing skin analysis request');
      
      // Mock analysis result - in a real app, this would call an AI model
      const analysisResult = {
        skinType: getRandomSkinType(),
        skinTone: getRandomSkinTone(),
        skinIssues: getRandomSkinIssues(),
        sunDamage: getRandomSunDamage(),
        uniqueFeature: getRandomUniqueFeature(),
        disease: getRandomDisease(),
        acneSeverity: getRandomAcneSeverity()
      };
      
      console.log('Analysis result:', analysisResult);
      
      return new Response(
        JSON.stringify({ success: true, ...analysisResult }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get the current user for all other actions
    const {
      data: { user },
    } = await supabaseClient.auth.getUser();

    if (!user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      );
    }

    if (action === 'save-chat') {
      const { message, response, products = [] } = data;
      
      // Save the chat
      const { data: chatData, error: chatError } = await supabaseClient
        .from('chat_history')
        .insert({
          user_id: user.id,
          message,
          response
        })
        .select()
        .single();

      if (chatError) throw chatError;

      // Save any product recommendations
      if (products.length > 0) {
        const productsWithChatId = products.map(product => ({
          ...product,
          user_id: user.id,
          chat_id: chatData.id
        }));

        const { error: productsError } = await supabaseClient
          .from('recommended_products')
          .insert(productsWithChatId);

        if (productsError) throw productsError;
      }

      return new Response(
        JSON.stringify({ success: true, chatId: chatData.id }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'save-scan') {
      const { 
        skinType, 
        skinIssues, 
        sunDamage,
        uniqueFeature,
        skinTone,
        scanImage,
        disease = 'No disease detected',
        acneSeverity = 'None'
      } = data;
      
      const { data: scanData, error: scanError } = await supabaseClient
        .from('skin_scan_history')
        .insert({
          user_id: user.id,
          skin_type: skinType,
          skin_issues: skinIssues,
          sun_damage: sunDamage,
          unique_feature: uniqueFeature,
          skin_tone: skinTone,
          scan_image: scanImage,
          disease: disease,
          acneSeverity: acneSeverity
        })
        .select()
        .single();

      if (scanError) throw scanError;

      return new Response(
        JSON.stringify({ success: true, scanId: scanData.id }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'get-history') {
      const { type } = data;
      
      if (type === 'chat') {
        const { data: chats, error: chatError } = await supabaseClient
          .from('chat_history')
          .select(`
            *,
            recommended_products(*)
          `)
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (chatError) throw chatError;

        return new Response(
          JSON.stringify({ success: true, chats }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      if (type === 'scan') {
        const { data: scans, error: scanError } = await supabaseClient
          .from('skin_scan_history')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (scanError) throw scanError;

        return new Response(
          JSON.stringify({ success: true, scans }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    return new Response(
      JSON.stringify({ error: 'Invalid action' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});

// Helper functions to generate random skin analysis results
function getRandomSkinType() {
  const types = ['Normal', 'Dry', 'Oily', 'Combination', 'Sensitive'];
  return types[Math.floor(Math.random() * types.length)];
}

function getRandomSkinTone() {
  const tones = ['Fair', 'Light', 'Medium', 'Olive', 'Tan', 'Deep', 'Dark'];
  return tones[Math.floor(Math.random() * tones.length)];
}

function getRandomSkinIssues() {
  const issues = [
    'None detected', 
    'Mild dryness', 
    'Slight redness', 
    'Minor blemishes',
    'Fine lines', 
    'Hyperpigmentation', 
    'Enlarged pores'
  ];
  return issues[Math.floor(Math.random() * issues.length)];
}

function getRandomSunDamage() {
  const damages = ['Minimal', 'Mild', 'Moderate', 'Significant'];
  return damages[Math.floor(Math.random() * damages.length)];
}

function getRandomUniqueFeature() {
  const features = [
    'None detected',
    'Freckles', 
    'Beauty marks', 
    'Even skin texture',
    'Natural glow', 
    'Strong skin barrier'
  ];
  return features[Math.floor(Math.random() * features.length)];
}

function getRandomDisease() {
  const diseases = [
    'No disease detected',
    'Mild eczema',
    'Possible rosacea',
    'Minor dermatitis'
  ];
  return diseases[Math.floor(Math.random() * diseases.length)];
}

function getRandomAcneSeverity() {
  const severities = ['None', 'Mild', 'Moderate', 'Severe'];
  return severities[Math.floor(Math.random() * severities.length)];
}
