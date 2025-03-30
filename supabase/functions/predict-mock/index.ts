
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

// This is a mock implementation of the skin analysis API
// to use when the local FastAPI server is not available
serve(async (req) => {
  try {
    // Enable CORS
    const headers = new Headers({
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      'Content-Type': 'application/json',
    });

    // Handle preflight request
    if (req.method === 'OPTIONS') {
      return new Response(null, { headers, status: 204 });
    }

    // Process the request
    const body = await req.json();
    const image = body.image;
    
    if (!image) {
      return new Response(
        JSON.stringify({ error: 'No image provided' }),
        { headers, status: 400 }
      );
    }

    // In a real implementation, this would analyze the image
    // Instead, we return mock data
    const mockAnalysisResult = {
      skinType: ['Dry', 'Normal', 'Oily', 'Combination'][Math.floor(Math.random() * 4)],
      skinTone: ['Fair', 'Light', 'Medium', 'Olive', 'Tan', 'Dark'][Math.floor(Math.random() * 6)],
      skinIssues: ['Acne', 'Dryness', 'Redness', 'Sensitivity', 'Aging'][Math.floor(Math.random() * 5)],
      sunDamage: ['Low', 'Moderate', 'High'][Math.floor(Math.random() * 3)],
      disease: Math.random() > 0.8 ? 'Signs of potential dermatitis' : 'No disease detected',
      acneSeverity: Math.random() > 0.7 ? ['Mild', 'Moderate', 'Severe'][Math.floor(Math.random() * 3)] : 'None'
    };

    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    return new Response(
      JSON.stringify(mockAnalysisResult),
      { headers, status: 200 }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
