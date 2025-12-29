import OpenAI, { toFile } from 'openai';
import type { ImageGenerationRequestParams, ImageEditRequestParams } from './types.js';
import * as fs from 'fs';

// Force GPT Image model for all generations (no DALL·E fallback)
const IMAGE_MODEL = 'gpt-image-1.5';
type GptImageSize = NonNullable<ImageGenerationRequestParams['size']>;
type ImageOutputFormat = 'webp' | 'png' | 'jpeg';
type InputFidelity = NonNullable<ImageEditRequestParams['inputFidelity']>;
type BackgroundType = NonNullable<ImageEditRequestParams['background']>;

export class ImageGenerator {
  private openai: OpenAI;
  constructor(apiKey: string = process.env.OPENAI_API_KEY!) {
    this.openai = new OpenAI({ apiKey });
  }

  async generateImage(
    prompt: string,
    size?: GptImageSize,
    outputFormat: ImageOutputFormat = 'png'
  ) {
    const effectiveSize: GptImageSize = size ?? '1024x1024';
    const response = await this.openai.images.generate({
      model: IMAGE_MODEL,
      prompt,
      size: effectiveSize,
      output_format: outputFormat,
      quality: 'high',
    });
    if (!response.data || !response.data[0] || !response.data[0].b64_json) {
      throw new Error('Failed to generate image: No image data received');
    }
    return response.data[0].b64_json;
  }

  async editImage(
    inputImagePaths: string[],
    prompt: string,
    options?: {
      inputFidelity?: InputFidelity;
      size?: GptImageSize;
      background?: BackgroundType;
    }
  ): Promise<string> {
    // Convert file paths to File objects for the API
    const imageFiles = await Promise.all(
      inputImagePaths.map(async (filePath) => {
        const buffer = await fs.promises.readFile(filePath);
        const filename = filePath.split('/').pop() || 'image.png';
        return toFile(buffer, filename, { type: 'image/png' });
      })
    );

    const response = await this.openai.images.edit({
      model: IMAGE_MODEL,
      image: imageFiles,
      prompt,
      size: options?.size ?? 'auto',
      quality: 'high',
      ...(options?.background && { background: options.background }),
    });

    if (!response.data || !response.data[0] || !response.data[0].b64_json) {
      throw new Error('Failed to edit image: No image data received');
    }
    return response.data[0].b64_json;
  }
}
