/**
 * CLAID.AI PREMIUM IMAGE OPTIMIZATION CLIENT wrapper
 * 
 * Claid.ai (by Let's Enhance) is a state-of-the-art API for:
 * 1. Background removal and replacement with custom premium backdrops.
 * 2. Smart Super-Resolution upscaling (perfect for budget phones like Infinix Hot 10).
 * 3. Smart retail auto-crop, padding, and lighting enhancements.
 * 
 * SECURITY NOTE:
 * To protect your Claid API Key from being exposed on the client side,
 * all requests should route through your Supabase Edge Function:
 * `supabase/functions/claid-enhance/index.ts`
 * 
 * This file contains both the client-side proxy caller and type definitions
 * for seamless integration into business product/service upload flows.
 */

export interface ClaidEnhanceOptions {
  /**
   * The type of AI enhancement to perform
   */
  operations: {
    /**
     * Remove the background and replace it with a solid color, transparent, or a studio canvas
     */
    backgroundRemoval?: {
      backgroundColor?: string; // e.g. "white", "#f5f5f7"
      premiumBackdropPrompt?: string; // e.g. "minimalist wooden table with soft focus studio lighting"
    };
    /**
     * Upscale low-resolution images to crystal-clear quality using Super-Resolution neural models
     */
    superResolution?: {
      scaleFactor: 2 | 4; // Scale size by 2x or 4x
    };
    /**
     * Apply professional studio color grading, exposure adjustment, and auto-cropping
     */
    studioLighting?: boolean;
    /**
     * Auto-convert output to highly-compressed WebP format
     */
    convertToWebp?: boolean;
  };
}

export interface ClaidApiResponse {
  success: boolean;
  outputUrl?: string;
  error?: string;
}

/**
 * Call the secure Supabase Edge Function to enhance a user's uploaded image using Claid.ai.
 * 
 * @param imageUrl The public URL of the uploaded image (e.g. from Supabase Storage temporary bucket).
 * @param options Enhancement configurations (Background removal, super-res, studio lighting).
 * @returns Object with the enhanced image URL or error.
 */
export async function enhanceImageWithClaid(
  imageUrl: string,
  options: ClaidEnhanceOptions
): Promise<ClaidApiResponse> {
  try {
    // 1. In local or demo mode without the Edge Function deployed, we provide a beautiful fallback simulation
    // to keep the frontend functional and showcase the Claid.ai power.
    const isMockMode = !import.meta.env.VITE_SUPABASE_URL || import.meta.env.DEV;
    
    if (isMockMode) {
      console.warn("Claid.ai: Supabase URL missing or in Dev Mode. Simulating professional AI enhancement...");
      await new Promise((resolve) => setTimeout(resolve, 2500)); // Simulate AI processing lag
      
      // Returns a beautiful, processed placeholder or the same URL simulating success
      return {
        success: true,
        outputUrl: imageUrl, // In mock mode, we gracefully return the source or a mock enhanced image
      };
    }

    // 2. Production flow: Call our secure Supabase Edge Function
    const { data, error } = await secureEdgeFunctionCall("claid-enhance", {
      imageUrl,
      options,
    });

    if (error) {
      throw new Error(error.message || "Failed to process image through Claid.ai");
    }

    return {
      success: true,
      outputUrl: data.enhancedUrl,
    };
  } catch (err: any) {
    console.error("Claid.ai API Error:", err);
    return {
      success: false,
      error: err.message || "An unexpected error occurred during image processing.",
    };
  }
}

/**
 * Helper to call Supabase Edge Functions securely with JWT headers
 */
async function secureEdgeFunctionCall(functionName: string, body: any) {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return { data: null, error: { message: "Supabase credentials missing" } };
  }

  const response = await fetch(`${supabaseUrl}/functions/v1/${functionName}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${supabaseAnonKey}`,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorText = await response.text();
    return { data: null, error: { message: errorText || "Edge function failed" } };
  }

  const data = await response.json();
  return { data, error: null };
}
