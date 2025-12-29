import type { TopazModel } from './topaz-upscaler.js';

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

  /**
   * Optional output image size for GPT Image (gpt-image-1.5).
   * - 'auto' lets the model pick the best size
   * - Defaults to '1024x1024' when omitted
   */
  size?: 'auto' | '1024x1024' | '1536x1024' | '1024x1536';

  /**
   * Optional: Upscale the generated image to this width (requires TOPAZ_API_KEY).
   * Must be used together with upscaleHeight.
   */
  upscaleWidth?: number;

  /**
   * Optional: Upscale the generated image to this height (requires TOPAZ_API_KEY).
   * Must be used together with upscaleWidth.
   */
  upscaleHeight?: number;

  /**
   * Optional: AI model to use for upscaling.
   * Default: "High Fidelity V2"
   */
  upscaleModel?: TopazModel;
}

/**
 * Interface for the parameters required to upscale an image
 */
export interface UpscaleImageRequestParams {
  /** The absolute path to the image to upscale */
  inputPath: string;

  /** The absolute path where to save the upscaled image */
  outputPath: string;

  /** Target width in pixels (1-32000) */
  width: number;

  /** Target height in pixels (1-32000) */
  height: number;

  /** AI model to use for upscaling. Default: "High Fidelity V2" */
  model?: TopazModel;
}

/**
 * Type guard to validate if the provided arguments match the ImageGenerationRequestParams interface
 *
 * @param args The arguments to validate
 * @returns Whether the arguments are valid image generation parameters
 */
export function isValidImageGenerationArgs(args: unknown): args is ImageGenerationRequestParams {
  if (typeof args !== 'object' || args === null) {
    return false;
  }

  const obj = args as Record<string, unknown>;
  const hasRequiredFields =
    'prompt' in obj &&
    typeof obj.prompt === 'string' &&
    'outputPath' in obj &&
    typeof obj.outputPath === 'string';

  if (!hasRequiredFields) return false;

  if (!('size' in obj) || typeof obj.size === 'undefined') {
    return true;
  }

  if (typeof obj.size !== 'string') return false;

  if (!['auto', '1024x1024', '1536x1024', '1024x1536'].includes(obj.size)) {
    return false;
  }

  // Validate upscale fields if present
  if ('upscaleWidth' in obj || 'upscaleHeight' in obj) {
    const hasWidth = 'upscaleWidth' in obj && typeof obj.upscaleWidth === 'number';
    const hasHeight = 'upscaleHeight' in obj && typeof obj.upscaleHeight === 'number';
    // Both must be present if either is specified
    if (hasWidth !== hasHeight) {
      return false;
    }
  }

  // Validate upscaleModel if present
  if ('upscaleModel' in obj && obj.upscaleModel !== undefined) {
    if (typeof obj.upscaleModel !== 'string') {
      return false;
    }
    const validModels = ['Standard V2', 'Low Resolution V2', 'High Fidelity V2', 'CGI'];
    if (!validModels.includes(obj.upscaleModel)) {
      return false;
    }
  }

  return true;
}

/**
 * Type guard to validate if the provided arguments match the UpscaleImageRequestParams interface
 */
export function isValidUpscaleArgs(args: unknown): args is UpscaleImageRequestParams {
  if (typeof args !== 'object' || args === null) {
    return false;
  }

  const obj = args as Record<string, unknown>;

  // Check required fields
  if (
    !('inputPath' in obj) ||
    typeof obj.inputPath !== 'string' ||
    !('outputPath' in obj) ||
    typeof obj.outputPath !== 'string' ||
    !('width' in obj) ||
    typeof obj.width !== 'number' ||
    !('height' in obj) ||
    typeof obj.height !== 'number'
  ) {
    return false;
  }

  // Validate dimensions
  if (obj.width < 1 || obj.width > 32000 || obj.height < 1 || obj.height > 32000) {
    return false;
  }

  // Validate model if present
  if ('model' in obj && obj.model !== undefined) {
    if (typeof obj.model !== 'string') {
      return false;
    }
    const validModels = ['Standard V2', 'Low Resolution V2', 'High Fidelity V2', 'CGI'];
    if (!validModels.includes(obj.model)) {
      return false;
    }
  }

  return true;
}

/**
 * Interface for the parameters required to edit an image
 */
export interface ImageEditRequestParams {
  /** Array of absolute paths to input images (1 or more) */
  inputImages: string[];

  /** The text prompt describing the edit */
  prompt: string;

  /** The absolute path where to save the edited image */
  outputPath: string;

  /**
   * How closely to preserve input images.
   * "high" uses more tokens but provides better fidelity.
   * Default: "medium"
   */
  inputFidelity?: 'low' | 'medium' | 'high';

  /** Output image size. Default: "auto" */
  size?: 'auto' | '1024x1024' | '1536x1024' | '1024x1536';

  /**
   * Background type for the output.
   * Use "transparent" for product extraction.
   * Default: "auto"
   */
  background?: 'transparent' | 'opaque' | 'auto';

  /** Optional: Upscale width (requires TOPAZ_API_KEY) */
  upscaleWidth?: number;

  /** Optional: Upscale height (requires TOPAZ_API_KEY) */
  upscaleHeight?: number;

  /** Optional: AI model to use for upscaling. Default: "High Fidelity V2" */
  upscaleModel?: TopazModel;
}

/**
 * Type guard to validate if the provided arguments match the ImageEditRequestParams interface
 */
export function isValidImageEditArgs(args: unknown): args is ImageEditRequestParams {
  if (typeof args !== 'object' || args === null) {
    return false;
  }

  const obj = args as Record<string, unknown>;

  // Check required fields
  if (
    !('inputImages' in obj) ||
    !Array.isArray(obj.inputImages) ||
    obj.inputImages.length === 0 ||
    !obj.inputImages.every((p: unknown) => typeof p === 'string')
  ) {
    return false;
  }

  if (!('prompt' in obj) || typeof obj.prompt !== 'string') {
    return false;
  }

  if (!('outputPath' in obj) || typeof obj.outputPath !== 'string') {
    return false;
  }

  // Validate optional enum fields
  if ('inputFidelity' in obj && obj.inputFidelity !== undefined) {
    if (
      typeof obj.inputFidelity !== 'string' ||
      !['low', 'medium', 'high'].includes(obj.inputFidelity)
    ) {
      return false;
    }
  }

  if ('size' in obj && obj.size !== undefined) {
    if (
      typeof obj.size !== 'string' ||
      !['auto', '1024x1024', '1536x1024', '1024x1536'].includes(obj.size)
    ) {
      return false;
    }
  }

  if ('background' in obj && obj.background !== undefined) {
    if (
      typeof obj.background !== 'string' ||
      !['transparent', 'opaque', 'auto'].includes(obj.background)
    ) {
      return false;
    }
  }

  // Validate upscale fields if present
  if ('upscaleWidth' in obj || 'upscaleHeight' in obj) {
    const hasWidth = 'upscaleWidth' in obj && typeof obj.upscaleWidth === 'number';
    const hasHeight = 'upscaleHeight' in obj && typeof obj.upscaleHeight === 'number';
    if (hasWidth !== hasHeight) {
      return false;
    }
  }

  // Validate upscaleModel if present
  if ('upscaleModel' in obj && obj.upscaleModel !== undefined) {
    if (typeof obj.upscaleModel !== 'string') {
      return false;
    }
    const validModels = ['Standard V2', 'Low Resolution V2', 'High Fidelity V2', 'CGI'];
    if (!validModels.includes(obj.upscaleModel)) {
      return false;
    }
  }

  return true;
}
