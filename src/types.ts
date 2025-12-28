/**
 * Interface for the parameters required to generate an image
 */
export interface ImageGenerationRequestParams {
  /** The text prompt to generate an image from */
  prompt: string;
  
  /** 
   * The absolute path where to save the image.
   * The directory will be created if it doesn't exist.
   * File extension (.webp) will be added automatically if not provided.
   */
  outputPath: string;

  /**
   * Optional output image size for GPT Image (gpt-image-1.5).
   * - 'auto' lets the model pick the best size
   * - Defaults to '1024x1024' when omitted
   */
  size?: 'auto' | '1024x1024' | '1536x1024' | '1024x1536';
}

/**
 * Type guard to validate if the provided arguments match the ImageGenerationRequestParams interface
 * 
 * @param args The arguments to validate
 * @returns Whether the arguments are valid image generation parameters
 */
export function isValidImageGenerationArgs(args: unknown): args is ImageGenerationRequestParams {
  if (typeof args !== "object" || args === null) {
    return false;
  }
  
  const obj = args as Record<string, unknown>;
  const hasRequiredFields =
    (
    "prompt" in obj &&
    typeof obj.prompt === 'string' &&
    "outputPath" in obj &&
    typeof obj.outputPath === 'string'
    );

  if (!hasRequiredFields) return false;

  if (!("size" in obj) || typeof obj.size === "undefined") {
    return true;
  }

  if (typeof obj.size !== "string") return false;

  return ["auto", "1024x1024", "1536x1024", "1024x1536"].includes(obj.size);
}