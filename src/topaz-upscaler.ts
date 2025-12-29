import FormData from "form-data";

const TOPAZ_API_URL = "https://api.topazlabs.com/image/v1/enhance";

export type TopazModel = "Standard V2" | "Low Resolution V2" | "High Fidelity V2" | "CGI";

export interface UpscaleOptions {
  imageData: Buffer;
  outputWidth: number;
  outputHeight: number;
  model?: TopazModel;
  outputFormat?: "jpeg" | "png";
}

export interface UpscaleResult {
  data: Buffer;
  originalWidth?: number;
  originalHeight?: number;
}

export class TopazUpscaler {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  /**
   * Check if Topaz upscaling is available (API key is configured)
   */
  static isAvailable(): boolean {
    return !!process.env.TOPAZ_API_KEY;
  }

  /**
   * Upscale an image using Topaz Labs Enhance API
   */
  async upscaleImage(options: UpscaleOptions): Promise<UpscaleResult> {
    const {
      imageData,
      outputWidth,
      outputHeight,
      model = "High Fidelity V2",
      outputFormat = "png",
    } = options;

    // Validate dimensions
    if (outputWidth < 1 || outputWidth > 32000) {
      throw new Error(`Invalid output width: ${outputWidth}. Must be between 1 and 32000.`);
    }
    if (outputHeight < 1 || outputHeight > 32000) {
      throw new Error(`Invalid output height: ${outputHeight}. Must be between 1 and 32000.`);
    }

    const form = new FormData();
    form.append("image", imageData, {
      filename: `image.${outputFormat}`,
      contentType: `image/${outputFormat}`,
    });
    form.append("output_width", outputWidth.toString());
    form.append("output_height", outputHeight.toString());
    form.append("model", model);
    form.append("output_format", outputFormat);

    const formBuffer = form.getBuffer();
    const formHeaders = form.getHeaders();

    const response = await fetch(TOPAZ_API_URL, {
      method: "POST",
      headers: {
        "X-API-Key": this.apiKey,
        ...formHeaders,
      },
      // Use type assertion for form-data buffer compatibility with fetch
      body: formBuffer as unknown as BodyInit,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Topaz API error (${response.status}): ${errorText}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    const resultBuffer = Buffer.from(arrayBuffer);

    return {
      data: resultBuffer,
    };
  }
}
