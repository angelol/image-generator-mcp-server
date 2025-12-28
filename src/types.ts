/**
 * Interface for the parameters required to generate an image
 */
export interface ImageGenerationRequestParams {
  /** The text prompt to generate an image from */
  prompt: string;
  
  /** 
   * The absolute path where to save the image.
   * The directory will be created if it doesn't exist.
   * File extension (.png) will be added automatically if not provided.
   */
  outputPath: string;
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
  return (
    "prompt" in obj &&
    typeof obj.prompt === 'string' &&
    "outputPath" in obj &&
    typeof obj.outputPath === 'string'
  );
}