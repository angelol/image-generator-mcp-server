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
import { isValidImageGenerationArgs } from "./types.js";
import { ImageGenerator } from "./image-generator.js";
import { FileSaver } from "./file-saver.js";

// Load environment variables from .env file
dotenv.config();

// Check for required API key
if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'your_openai_api_key_here') {
  console.error("[WARNING] Please set a valid OPENAI_API_KEY in the .env file");
  console.error("[WARNING] The server will run, but image generation will not work");
}

// Create file saver instance
const fileSaver = new FileSaver();

const server = new Server(
  {
    name: "image-generator",
    version: "0.1.0"
  },
  {
    capabilities: {
      resources: {},
      tools: {}
    }
  }
);

// Define available tools
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [{
    name: "generate_image",
    description: "Generate an image from a prompt.",
    inputSchema: {
      type: "object",
      properties: {
        prompt: {
          type: "string",
          description: "A prompt detailing what image to generate."
        },
        outputPath: {
          type: "string",
          description: "The absolute path where to save the image. The directory will be created if it doesn't exist. File extension (.png) will be added automatically if not provided."
        }
      },
      required: ["prompt", "outputPath"]
    }
  }]
}));

// Define available resources
server.setRequestHandler(ListResourcesRequestSchema, async () => {
  return {
    resources: [
      {
        uri: "dalle://images",
        mimeType: "image/png",
        name: "Generated Images",
      },
    ],
  };
});

// Handle resource read requests
server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
  if (request.params.uri === "dalle://images") {
    return {
      contents: [
        {
          uri: "dalle://images",
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
  if (request.params.name !== "generate_image") {
    throw new McpError(
      ErrorCode.MethodNotFound,
      `Unknown tool: ${request.params.name}`
    );
  }

  if (!isValidImageGenerationArgs(request.params.arguments)) {
    throw new McpError(
      ErrorCode.InvalidParams,
      "Invalid image generation arguments"
    );
  }
  
  // Check for API key before processing
  if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'your_openai_api_key_here') {
    return {
      content: [
        {
          type: "text",
          text: "Error: Missing or invalid OPENAI_API_KEY in .env file. Please add a valid API key."
        }
      ],
      isError: true
    };
  }
  
  try {
    const { prompt, outputPath } = request.params.arguments;
    
    // Generate the image
    const imageGenerator = new ImageGenerator();
    const base64Image = await imageGenerator.generateImage(prompt);
    
    if (!base64Image) {
      throw new Error("Failed to generate image: No image data received");
    }
    
    // Use the absolute path directly - ensure it's absolute
    const absolutePath = path.isAbsolute(outputPath) 
      ? outputPath 
      : path.resolve(process.cwd(), outputPath);
    
    // Save the image with .png extension
    const savedFilePath = await fileSaver.saveBase64(absolutePath, base64Image, 'png');
    
    return {
      content: [
        {
          type: "text",
          text: `✅ Image generated successfully!

📁 File saved to: ${savedFilePath}

📝 Generation details:
• Prompt: "${prompt}"
• Model: DALL-E 3
• Resolution: 1024x1024`
        }
      ]
    };
  } catch (error) {
    console.error("[Image Generation Error]", error);
    return {
      content: [
        {
          type: "text",
          text: `❌ Error generating image: ${error instanceof Error ? error.message : String(error)}`
        }
      ],
      isError: true
    };
  }
});

async function runServer() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Image Generator MCP server running on stdio");
}

runServer().catch(console.error);
