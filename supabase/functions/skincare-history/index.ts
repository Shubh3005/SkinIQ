
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

  // Get the current user
  const {
    data: { user },
  } = await supabaseClient.auth.getUser();

  if (!user) {
    return new Response(
      JSON.stringify({ error: 'Unauthorized' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
    );
  }

  try {
    const { action, data } = await req.json();

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
