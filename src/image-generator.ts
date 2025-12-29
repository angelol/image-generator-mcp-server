import OpenAI from "openai";
import type { ImageGenerationRequestParams } from "./types.js";

// Force GPT Image model for all generations (no DALL·E fallback)
const IMAGE_MODEL = "gpt-image-1.5";
type GptImageSize = NonNullable<ImageGenerationRequestParams["size"]>;

export class ImageGenerator {
    private openai: OpenAI;
    constructor(apiKey:string = process.env.OPENAI_API_KEY!) {
        this.openai = new OpenAI({ apiKey });
    }

    async generateImage(prompt: string, size?: GptImageSize) {
        const effectiveSize: GptImageSize = size ?? "1024x1024";
        const response = await this.openai.images.generate({
            model: IMAGE_MODEL,
            prompt,
            size: effectiveSize,
            // Generate WebP (smaller files, great quality) and save as .webp on disk.
            output_format: 'webp',
            quality: 'high',
        });
        if (!response.data || !response.data[0] || !response.data[0].b64_json) {
            throw new Error("Failed to generate image: No image data received");
        }
        return response.data[0].b64_json;
    }
}