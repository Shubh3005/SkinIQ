
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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
    // Parse request body (this would contain the image)
    const { image } = await req.json();
    
    // Verify the image was included
    if (!image) {
      return new Response(
        JSON.stringify({ error: 'Image data is required' }), 
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }
    
    console.log("Received image data, length:", image.length);
    
    // Create a random skin analysis result
    // This is a fallback if the machine learning model is not available
    const analysisResult = {
      skinType: getRandomSkinType(),
      skinTone: getRandomSkinTone(),
      skinIssues: getRandomSkinIssues(),
      uniqueFeature: getRandomUniqueFeature(),
      disease: getRandomDisease(),
      acneSeverity: getRandomAcneSeverity(),
    };
    
    // Simulate some processing time (0.5-1.5 seconds)
    await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000));
    
    return new Response(
      JSON.stringify(analysisResult),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error("Error in predict-mock function:", error);
    
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
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
