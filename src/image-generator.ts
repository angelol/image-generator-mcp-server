import OpenAI from "openai";
import { ImageGenerateParams } from "openai/resources/images.mjs";

// Force GPT Image model for all generations (no DALL·E fallback)
const IMAGE_MODEL = "gpt-image-1.5";

export class ImageGenerator {
    private openai: OpenAI;
    constructor(apiKey:string = process.env.OPENAI_API_KEY!) {
        this.openai = new OpenAI({ apiKey });
    }

    async generateImage(prompt: string, size: ImageGenerateParams['size'] = "1024x1024") {
        const response = await this.openai.images.generate({
            model: IMAGE_MODEL,
            prompt,
            size,
            response_format: 'b64_json',
            // We save with a .png extension; generate PNG to match the file format.
            output_format: 'png',
        });
        if (!response.data || !response.data[0] || !response.data[0].b64_json) {
            throw new Error("Failed to generate image: No image data received");
        }
        return response.data[0].b64_json;
    }
}