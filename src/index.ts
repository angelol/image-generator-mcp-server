#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  ListToolsRequestSchema,
  CallToolRequestSchema,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
  ErrorCode,
  McpError
} from "@modelcontextprotocol/sdk/types.js";

import dotenv from "dotenv";
import * as path from 'path';
import { isValidImageGenerationArgs, isValidUpscaleArgs, isValidImageEditArgs } from "./types.js";
import { ImageGenerator } from "./image-generator.js";
import { FileSaver } from "./file-saver.js";
import { TopazUpscaler } from "./topaz-upscaler.js";
import * as fs from 'fs';

// GPT-Image-1.5 Prompting Guide
const PROMPTING_GUIDE = `# GPT-Image-1.5 Prompting Guide

gpt-image-1.5 is OpenAI's latest image generation model, designed for production-quality visuals and highly controllable creative workflows. It delivers major improvements in realism, accuracy, and editability.

## Key Capabilities
- High-fidelity photorealism with natural lighting, accurate materials, and rich color rendering
- Robust facial and identity preservation for edits and character consistency
- Reliable text rendering with crisp lettering and consistent layout
- Complex structured visuals including infographics, diagrams, and multi-panel compositions
- Precise style control and style transfer with minimal prompting
- Strong real-world knowledge and reasoning for accurate depictions

---

## Prompting Fundamentals

### Prompt Structure
Write prompts in a consistent order:
1. Background/scene
2. Subject
3. Key details
4. Constraints

Include the intended use (ad, UI mock, infographic) to set the "mode" and level of polish. For complex requests, use short labeled segments or line breaks instead of one long paragraph.

### Specificity and Quality Cues
- Be concrete about materials, shapes, textures, and the visual medium (photo, watercolor, 3D render)
- Add targeted "quality levers" only when needed (e.g., film grain, textured brushstrokes, macro detail)
- For photorealism, camera/composition terms (lens, aperture feel, lighting) steer realism more reliably than generic "8K/ultra-detailed"

### Composition
- Specify framing and viewpoint: close-up, wide, top-down
- Specify perspective/angle: eye-level, low-angle, bird's eye
- Specify lighting/mood: soft diffuse, golden hour, high-contrast, studio lighting
- If layout matters, call out placement: "logo top-right," "subject centered with negative space on left"

### Constraints (What to Change vs Preserve)
- State exclusions explicitly: "no watermark," "no extra text," "no logos/trademarks"
- For edits, use "change only X" + "keep everything else the same"
- Repeat the preserve list on each iteration to reduce drift

### Text in Images
- Put literal text in **"quotes"** or **ALL CAPS**
- Specify typography details: font style, size, color, placement
- For tricky words (brand names, uncommon spellings), spell them out letter-by-letter to improve accuracy
- Example: For "ACME", write: A-C-M-E

### Iterate Instead of Overloading
- Start with a clean base prompt
- Refine with small, single-change follow-ups ("make lighting warmer," "remove the extra tree")
- Use references like "same style as before" or "the subject" to leverage context
- Re-specify critical details if they start to drift

---

## Size Selection
- **1024x1024**: Default square format
- **1536x1024**: Landscape (16:10) - good for wide scenes, banners
- **1024x1536**: Portrait (10:16) - good for mobile, vertical content
- **auto**: Let the model choose based on content

---

## Use Cases: Generation (text → image)

### Infographics
Use for explaining structured information: explainers, posters, labeled diagrams, timelines.

Example prompt structure:
\`\`\`
Create a detailed Infographic of [topic].
Show [components/flow/process].
I'd like to understand technically and visually the [subject].
\`\`\`

### Photorealistic Images
Prompt as if capturing a real photo. Use photography language and explicitly ask for real texture.

Example prompt:
\`\`\`
Create a photorealistic candid photograph of [subject].
[Physical details with imperfections: weathered skin, visible wrinkles, pores, worn materials].
Shot like a 35mm film photograph, medium close-up at eye level, using a 50mm lens.
Soft coastal daylight, shallow depth of field, subtle film grain, natural color balance.
The image should feel honest and unposed. No glamorization, no heavy retouching.
\`\`\`

### Logo Generation
Focus on brand constraints and simplicity.

Example prompt:
\`\`\`
Create an original, non-infringing logo for [company name], a [business type].
The logo should feel [mood: warm, modern, playful, professional].
Use clean, vector-like shapes, a strong silhouette, and balanced negative space.
Favor simplicity over detail so it reads clearly at small and large sizes.
Flat design, minimal strokes, no gradients unless essential.
Plain background. Deliver a single centered logo with generous padding.
No watermark.
\`\`\`

### UI Mockups
Describe the product as if it already exists. Focus on layout, hierarchy, spacing.

Example prompt:
\`\`\`
Create a realistic mobile app UI mockup for [app purpose].
Show [specific UI elements: header, list, sections, navigation].
Design it to be practical and easy to use.
White background, subtle accent colors, clear typography, minimal decoration.
It should look like a real, well-designed app.
Place the UI mockup in an iPhone frame.
\`\`\`

### Story-to-Comic Strip
Define narrative as a sequence of clear visual beats, one per panel.

Example prompt:
\`\`\`
Create a short vertical comic-style reel with 4 equal-sized panels.
Panel 1: [Scene description with emotional cues]
Panel 2: [Action/transition]
Panel 3: [Development]
Panel 4: [Resolution/punchline]
\`\`\`

---

## Use Cases: Editing (image + text → image)

### Style Transfer
Keep the visual language of a reference while changing subject/scene.

Example prompt:
\`\`\`
Use the same style from the input image and generate [new subject] on a [background].
\`\`\`

### Object/Element Removal
Be surgical and specific about what to remove.

Example prompt:
\`\`\`
Remove [specific element] from [location in image]. Do not change anything else.
\`\`\`

### Lighting and Weather Transformation
Change only environmental conditions while preserving composition.

Example prompt:
\`\`\`
Make it look like [new condition: winter evening with snowfall, golden hour, overcast day].
Preserve the scene composition, subject, and camera angle.
\`\`\`

### Product Mockups (Background Removal)
Focus on edge quality and label integrity.

Example prompt:
\`\`\`
Extract the product from the input image.
Output: transparent background (RGBA PNG), crisp silhouette, no halos/fringing.
Preserve product geometry and label legibility exactly.
Optional: subtle, realistic contact shadow in the alpha.
Do not restyle the product; only remove background and lightly polish.
\`\`\`

### Marketing Creatives with Text
Typography needs explicit constraints.

Example prompt:
\`\`\`
Create a [format: billboard, poster, ad] mockup of [product/scene].
[Scene/environment description].
Text (EXACT, verbatim, no extra characters):
"[Your text here]"
Typography: bold sans-serif, high contrast, centered, clean kerning.
Ensure text appears once and is perfectly legible.
No watermarks, no logos.
\`\`\`

### Interior Design Swaps
Surgical replacement while preserving environment.

Example prompt:
\`\`\`
In this room photo, replace ONLY [item] with [new item description].
Preserve camera angle, room lighting, floor shadows, and surrounding objects.
Keep all other aspects of the image unchanged.
Photorealistic contact shadows and material texture.
\`\`\`

---

## Character Consistency (Multi-Image Workflows)

For multi-page illustrations or consistent characters:

1. **Create Character Anchor First**
\`\`\`
Create a [style] illustration introducing a main character.
Character: [Detailed description of appearance, clothing, expression, proportions]
Theme: [Character's role/story]
Style: [Art style details]
Constraints: Original character, no text, no watermarks, plain background
\`\`\`

2. **Continue with Same Character**
\`\`\`
Continue the [style] story using the same character.
Scene: [New scene description]
Character Consistency:
- Same [clothing items]
- Same facial features, proportions, and color palette
- Same personality traits
Style: [Maintain original style]
Constraints: Do not redesign the character, no text, no watermarks
\`\`\`

---

## Best Practices Summary

1. **Structure prompts consistently**: scene → subject → details → constraints
2. **Be specific**: materials, textures, lighting, camera terms
3. **Use photography language** for photorealism (lens, aperture, film grain)
4. **Quote text exactly** and specify typography
5. **State what NOT to include** explicitly
6. **Iterate in small steps** rather than overloading one prompt
7. **Preserve identity/layout** by restating constraints on each edit
8. **Use appropriate size** for the content type
`;

// Load environment variables from .env file
dotenv.config();

// Check for required API key
if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'your_openai_api_key_here') {
  console.error("[WARNING] Please set a valid OPENAI_API_KEY in the .env file");
  console.error("[WARNING] The server will run, but image generation will not work");
}

// Check if Topaz upscaling is available
const topazAvailable = TopazUpscaler.isAvailable();
if (topazAvailable) {
  console.error("[INFO] Topaz Labs upscaling is enabled");
} else {
  console.error("[INFO] Topaz Labs upscaling is disabled (set TOPAZ_API_KEY to enable)");
}

// Create file saver instance
const fileSaver = new FileSaver();

// Track whether the prompting guide has been read this session
let promptingGuideRead = false;

const server = new Server(
  {
    name: "image-generator",
    version: "0.1.0"
  },
  {
    capabilities: {
      resources: {},
      tools: {}
    },
    instructions: "Before generating images, read the prompting guide resource at image-generator://prompting-guide for best practices on crafting effective prompts for gpt-image-1.5."
  }
);

// Define available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  // Base generate_image tool properties
  const generateImageProperties: Record<string, object> = {
    prompt: {
      type: "string",
      description: "A prompt detailing what image to generate."
    },
    outputPath: {
      type: "string",
      description: "The absolute path where to save the image. The directory will be created if it doesn't exist. File extension (.png) will be added automatically if not provided."
    },
    size: {
      type: "string",
      enum: ["auto", "1024x1024", "1536x1024", "1024x1536"],
      description: "Optional output image size for GPT Image (gpt-image-1.5). Use 'auto' to let the model choose. Defaults to 1024x1024."
    }
  };

  // Add upscale options if Topaz is available
  if (topazAvailable) {
    generateImageProperties.upscaleWidth = {
      type: "number",
      description: "Optional: Upscale the generated image to this width in pixels (1-32000). Requires upscaleHeight to also be set."
    };
    generateImageProperties.upscaleHeight = {
      type: "number",
      description: "Optional: Upscale the generated image to this height in pixels (1-32000). Requires upscaleWidth to also be set."
    };
  }

  const tools = [
    {
      name: "generate_image",
      description: topazAvailable
        ? "Generate an image from a prompt. Optionally upscale to higher resolution using Topaz Labs AI."
        : "Generate an image from a prompt.",
      inputSchema: {
        type: "object",
        properties: generateImageProperties,
        required: ["prompt", "outputPath"]
      }
    }
  ];

  // Add upscale_image tool if Topaz is available
  if (topazAvailable) {
    tools.push({
      name: "upscale_image",
      description: "Upscale an existing image to higher resolution using Topaz Labs AI.",
      inputSchema: {
        type: "object",
        properties: {
          inputPath: {
            type: "string",
            description: "The absolute path to the image to upscale."
          },
          outputPath: {
            type: "string",
            description: "The absolute path where to save the upscaled image. File extension (.png) will be added automatically if not provided."
          },
          width: {
            type: "number",
            description: "Target width in pixels (1-32000)."
          },
          height: {
            type: "number",
            description: "Target height in pixels (1-32000)."
          },
          model: {
            type: "string",
            enum: ["Standard V2", "Low Resolution V2", "High Fidelity V2", "CGI"],
            description: "AI model to use for upscaling. Default: Standard V2."
          }
        },
        required: ["inputPath", "outputPath", "width", "height"]
      }
    });
  }

  // Build edit_image tool properties
  const editImageProperties: Record<string, object> = {
    inputImages: {
      type: "array",
      items: { type: "string" },
      description: "Array of absolute paths to input images. First image is the base; additional images are references for compositing or style transfer."
    },
    prompt: {
      type: "string",
      description: "Description of the edit to perform (e.g., 'Remove the background', 'Apply the style from image 2 to image 1', 'Add the logo to the shirt')."
    },
    outputPath: {
      type: "string",
      description: "The absolute path where to save the edited image. File extension (.png) will be added automatically if not provided."
    },
    size: {
      type: "string",
      enum: ["auto", "1024x1024", "1536x1024", "1024x1536"],
      description: "Output image size. Default: auto."
    },
    background: {
      type: "string",
      enum: ["transparent", "opaque", "auto"],
      description: "Background type. Use 'transparent' for product extraction/background removal. Default: auto."
    }
  };

  // Add upscale options to edit_image if Topaz is available
  if (topazAvailable) {
    editImageProperties.upscaleWidth = {
      type: "number",
      description: "Optional: Upscale the edited image to this width in pixels (1-32000). Requires upscaleHeight to also be set."
    };
    editImageProperties.upscaleHeight = {
      type: "number",
      description: "Optional: Upscale the edited image to this height in pixels (1-32000). Requires upscaleWidth to also be set."
    };
  }

  tools.push({
    name: "edit_image",
    description: topazAvailable
      ? "Edit one or more images using a text prompt. Supports style transfer, object removal, compositing, background removal, and more. Optionally upscale the result using Topaz Labs AI."
      : "Edit one or more images using a text prompt. Supports style transfer, object removal, compositing, background removal, and more.",
    inputSchema: {
      type: "object",
      properties: editImageProperties,
      required: ["inputImages", "prompt", "outputPath"]
    }
  });

  return { tools };
});

// Define available resources
server.setRequestHandler(ListResourcesRequestSchema, async () => {
  return {
    resources: [
      {
        uri: "image-generator://prompting-guide",
        mimeType: "text/markdown",
        name: "GPT-Image-1.5 Prompting Guide",
        description: "Best practices for crafting effective image generation prompts"
      },
      {
        uri: "image-generator://images",
        mimeType: "image/png",
        name: "Generated Images",
      },
    ],
  };
});

// Handle resource read requests
server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
  if (request.params.uri === "image-generator://prompting-guide") {
    promptingGuideRead = true;
    return {
      contents: [
        {
          uri: "image-generator://prompting-guide",
          mimeType: "text/markdown",
          text: PROMPTING_GUIDE,
        },
      ],
    };
  }
  if (request.params.uri === "image-generator://images") {
    return {
      contents: [
        {
          uri: "image-generator://images",
          mimeType: "image/png",
          blob: "", // Empty since this is just for listing
        },
      ],
    };
  }
  throw new McpError(ErrorCode.InvalidParams, "Resource not found");
});

// Handle tool execution
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const toolName = request.params.name;

  // Handle upscale_image tool
  if (toolName === "upscale_image") {
    if (!topazAvailable) {
      return {
        content: [{ type: "text", text: "Error: TOPAZ_API_KEY is not configured. Upscaling is not available." }],
        isError: true
      };
    }

    if (!isValidUpscaleArgs(request.params.arguments)) {
      throw new McpError(ErrorCode.InvalidParams, "Invalid upscale arguments");
    }

    try {
      const { inputPath, outputPath, width, height, model } = request.params.arguments;

      // Validate input file exists
      const absoluteInputPath = path.isAbsolute(inputPath) ? inputPath : path.resolve(process.cwd(), inputPath);
      if (!fs.existsSync(absoluteInputPath)) {
        return {
          content: [{ type: "text", text: `Error: Input file not found: ${absoluteInputPath}` }],
          isError: true
        };
      }

      // Read input image
      const imageData = await fs.promises.readFile(absoluteInputPath);

      // Upscale the image
      const upscaler = new TopazUpscaler(process.env.TOPAZ_API_KEY!);
      const result = await upscaler.upscaleImage({
        imageData,
        outputWidth: width,
        outputHeight: height,
        model: model,
        outputFormat: "png"
      });

      // Save the upscaled image
      const absoluteOutputPath = path.isAbsolute(outputPath) ? outputPath : path.resolve(process.cwd(), outputPath);
      const savedFilePath = await fileSaver.saveBase64(absoluteOutputPath, result.data.toString('base64'), 'png');

      return {
        content: [{
          type: "text",
          text: `Image upscaled successfully!

File saved to: ${savedFilePath}

Upscale details:
- Target resolution: ${width}x${height}
- Model: ${model ?? "Standard V2"}
- Format: png`
        }]
      };
    } catch (error) {
      console.error("[Upscale Error]", error);
      return {
        content: [{ type: "text", text: `Error upscaling image: ${error instanceof Error ? error.message : String(error)}` }],
        isError: true
      };
    }
  }

  // Handle generate_image tool
  if (toolName === "generate_image") {
    if (!isValidImageGenerationArgs(request.params.arguments)) {
      throw new McpError(ErrorCode.InvalidParams, "Invalid image generation arguments");
    }

    // Check if prompting guide has been read
    if (!promptingGuideRead) {
      return {
        content: [{
          type: "text",
          text: `Error: Please read the prompting guide first to learn best practices for crafting effective prompts.

You can read it by fetching the resource at: image-generator://prompting-guide

Here is the guide content for convenience:

${PROMPTING_GUIDE}

Please retry your request after reviewing the guide.`
        }],
        isError: true
      };
    }

    // Check for API key before processing
    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'your_openai_api_key_here') {
      return {
        content: [{ type: "text", text: "Error: Missing or invalid OPENAI_API_KEY in .env file. Please add a valid API key." }],
        isError: true
      };
    }

    try {
      const { prompt, outputPath, size, upscaleWidth, upscaleHeight } = request.params.arguments;

      const willUpscale = upscaleWidth && upscaleHeight && topazAvailable;

      // Generate the image (always PNG for Topaz compatibility)
      const imageGenerator = new ImageGenerator();
      const base64Image = await imageGenerator.generateImage(prompt, size, 'png');

      if (!base64Image) {
        throw new Error("Failed to generate image: No image data received");
      }

      // Use the absolute path directly - ensure it's absolute
      const absolutePath = path.isAbsolute(outputPath) ? outputPath : path.resolve(process.cwd(), outputPath);

      // Save the image
      let savedFilePath = await fileSaver.saveBase64(absolutePath, base64Image, 'png');

      const resolution = size ?? "1024x1024";
      let upscaleInfo = "";

      // Upscale if requested and Topaz is available
      if (willUpscale) {
        const imageBuffer = Buffer.from(base64Image, 'base64');
        const upscaler = new TopazUpscaler(process.env.TOPAZ_API_KEY!);
        const result = await upscaler.upscaleImage({
          imageData: imageBuffer,
          outputWidth: upscaleWidth,
          outputHeight: upscaleHeight,
          model: "High Fidelity V2",
          outputFormat: "png"
        });

        // Overwrite the file with the upscaled version
        savedFilePath = await fileSaver.saveBase64(absolutePath, result.data.toString('base64'), 'png');
        upscaleInfo = `
- Upscaled to: ${upscaleWidth}x${upscaleHeight} (via Topaz High Fidelity V2)`;
      }

      return {
        content: [{
          type: "text",
          text: `Image generated successfully!

File saved to: ${savedFilePath}

Generation details:
- Prompt: "${prompt}"
- Model: gpt-image-1.5
- Original resolution: ${resolution}${upscaleInfo}
- Format: png`
        }]
      };
    } catch (error) {
      console.error("[Image Generation Error]", error);
      return {
        content: [{ type: "text", text: `Error generating image: ${error instanceof Error ? error.message : String(error)}` }],
        isError: true
      };
    }
  }

  // Handle edit_image tool
  if (toolName === "edit_image") {
    if (!isValidImageEditArgs(request.params.arguments)) {
      throw new McpError(ErrorCode.InvalidParams, "Invalid image edit arguments");
    }

    // Check if prompting guide has been read
    if (!promptingGuideRead) {
      return {
        content: [{
          type: "text",
          text: `Error: Please read the prompting guide first to learn best practices for crafting effective prompts.

You can read it by fetching the resource at: image-generator://prompting-guide

Here is the guide content for convenience:

${PROMPTING_GUIDE}

Please retry your request after reviewing the guide.`
        }],
        isError: true
      };
    }

    // Check for API key before processing
    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'your_openai_api_key_here') {
      return {
        content: [{ type: "text", text: "Error: Missing or invalid OPENAI_API_KEY in .env file. Please add a valid API key." }],
        isError: true
      };
    }

    try {
      const { inputImages, prompt, outputPath, size, background, upscaleWidth, upscaleHeight } = request.params.arguments;

      // Validate all input files exist
      const absoluteInputPaths: string[] = [];
      for (const imagePath of inputImages) {
        const absolutePath = path.isAbsolute(imagePath) ? imagePath : path.resolve(process.cwd(), imagePath);
        if (!fs.existsSync(absolutePath)) {
          return {
            content: [{ type: "text", text: `Error: Input file not found: ${absolutePath}` }],
            isError: true
          };
        }
        absoluteInputPaths.push(absolutePath);
      }

      const willUpscale = upscaleWidth && upscaleHeight && topazAvailable;

      // Edit the image
      const imageGenerator = new ImageGenerator();
      const base64Image = await imageGenerator.editImage(absoluteInputPaths, prompt, {
        size,
        background
      });

      if (!base64Image) {
        throw new Error("Failed to edit image: No image data received");
      }

      // Use the absolute path directly - ensure it's absolute
      const absoluteOutputPath = path.isAbsolute(outputPath) ? outputPath : path.resolve(process.cwd(), outputPath);

      // Save the image
      let savedFilePath = await fileSaver.saveBase64(absoluteOutputPath, base64Image, 'png');

      const resolution = size ?? "auto";
      let upscaleInfo = "";

      // Upscale if requested and Topaz is available
      if (willUpscale) {
        const imageBuffer = Buffer.from(base64Image, 'base64');
        const upscaler = new TopazUpscaler(process.env.TOPAZ_API_KEY!);
        const result = await upscaler.upscaleImage({
          imageData: imageBuffer,
          outputWidth: upscaleWidth,
          outputHeight: upscaleHeight,
          model: "High Fidelity V2",
          outputFormat: "png"
        });

        // Overwrite the file with the upscaled version
        savedFilePath = await fileSaver.saveBase64(absoluteOutputPath, result.data.toString('base64'), 'png');
        upscaleInfo = `
- Upscaled to: ${upscaleWidth}x${upscaleHeight} (via Topaz High Fidelity V2)`;
      }

      return {
        content: [{
          type: "text",
          text: `Image edited successfully!

File saved to: ${savedFilePath}

Edit details:
- Input images: ${inputImages.length} file(s)
- Prompt: "${prompt}"
- Model: gpt-image-1.5
- Output size: ${resolution}${background ? `\n- Background: ${background}` : ''}${upscaleInfo}
- Format: png`
        }]
      };
    } catch (error) {
      console.error("[Image Edit Error]", error);
      return {
        content: [{ type: "text", text: `Error editing image: ${error instanceof Error ? error.message : String(error)}` }],
        isError: true
      };
    }
  }

  throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${toolName}`);
});

async function runServer() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Image Generator MCP server running on stdio");
}

runServer().catch(console.error);
