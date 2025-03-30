
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// Define product info interface
interface ProductInfo {
  name: string;
  url: string;
  imageUrl?: string;
  description?: string;
}

// Define the handler for our Supabase Edge Function
Deno.serve(async (req) => {
  try {
    // Get the CORS headers
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    };

    // Handle preflight OPTIONS request
    if (req.method === 'OPTIONS') {
      return new Response('ok', { headers: corsHeaders });
    }

    // Initialize the Supabase client using environment variables
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    // Parse the request body
    const { products } = await req.json();

    // Function to fetch image URLs from product page
    const fetchProductImages = async (productUrl: string): Promise<string[]> => {
      try {
        const response = await fetch(productUrl, {
          headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
          }
        });
        
        if (!response.ok) return [];
        
        const html = await response.text();
        
        // Simple regex to find image URLs (note: this is a simplified approach)
        const imgRegex = /<img[^>]+src="([^">]+\.jpg)"/g;
        const matches = [...html.matchAll(imgRegex)];
        
        return matches.map(m => m[1]).slice(0, 3); // Return max 3 images
      } catch (error) {
        console.error('Error fetching images:', error);
        return [];
      }
    };

    // Process the products data and fetch images
    const processedProducts: ProductInfo[] = [];
    
    for (const product of products) {
      if (!product.name || !product.url) continue;
      
      const imageUrls = await fetchProductImages(product.url);
      
      processedProducts.push({
        name: product.name,
        url: product.url,
        imageUrl: imageUrls.length > 0 ? imageUrls[0] : undefined,
        description: product.description
      });
    }

    // Return processed data
    return new Response(
      JSON.stringify({ 
        success: true,
        data: processedProducts
      }),
      { 
        headers: { 
          "Content-Type": "application/json",
          ...corsHeaders
        } 
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message
      }),
      { 
        headers: { "Content-Type": "application/json" },
        status: 400
      }
    );
  }
});
