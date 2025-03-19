# image-generator MCP Server

An MCP server that generates images based on text prompts

This is a TypeScript-based MCP server that implements image generation using **OPENAI**'s `dall-e-3` image generation model.

## Features

### Tools
- `generate_image` - Generate an image for given prompt
  - Takes `prompt` as a required parameter - The text description of the image to generate
  - Takes `outputPath` as a required parameter - The absolute path where to save the generated image
  - Directories will be created automatically if they don't exist
  - The `.png` extension is added automatically if not included in the path

## Setup

### Environment Variables

Create a `.env` file in the project root with your OpenAI API key:

```
OPENAI_API_KEY=your_openai_api_key_here
```

### Development

Install dependencies:
```bash
npm install
```

Build the server:
```bash
npm run build
```

Link the package for local use:
```bash
npm link
```

For development with auto-rebuild:
```bash
npm run watch
```

**Important**: After making changes to the server, you must:
1. Rebuild with `npm run build`
2. Run `npm link` again
3. Restart Cursor completely for changes to take effect

## Installation

To use with Cursor, the server must be linked globally:

```bash
npm link
```

### Using with Cursor

Cursor will automatically detect the MCP server after linking. You can test functionality with:

```javascript
mcp_dalle_generate_image({
  prompt: "A beautiful mountain landscape", 
  outputPath: "/Users/yourusername/Pictures/generated_images/mountains"
})
```

### Debugging

Since MCP servers communicate over stdio, debugging can be challenging. We recommend using the [MCP Inspector](https://github.com/modelcontextprotocol/inspector), which is available as a package script:

```bash
npm run inspector
```

The Inspector will provide a URL to access debugging tools in your browser.

> **⚠️ Warning**: The Inspector currently has a timeout of 10 seconds. Since image generation often takes longer than this, the inspector may show timeout errors when testing the `generate_image` tool. For now, it's best to test directly in Cursor after rebuilding and restarting.
