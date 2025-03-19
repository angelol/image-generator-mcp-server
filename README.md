# DALL-E Image Generator for MCP Applications

<div align="center">

<img src="./logo.png" alt="DALL-E Image Generator Logo" width="200"/>

**Generate beautiful AI images using DALL-E 3 in any MCP-compatible application**

[![TypeScript](https://img.shields.io/badge/TypeScript-5.8.2-blue.svg)](https://www.typescriptlang.org/)
[![OpenAI](https://img.shields.io/badge/OpenAI-DALL--E%203-green.svg)](https://openai.com/)
[![MCP](https://img.shields.io/badge/MCP-Model%20Context%20Protocol-purple.svg)](https://github.com/modelcontextprotocol/spec)

</div>

## 🌟 Overview

This is a Model Context Protocol (MCP) server that brings OpenAI's DALL-E 3 image generation capabilities to any MCP-compatible application including Cursor, Claude Desktop, Windsurf, and more. With a simple function call, you can generate high-quality AI images and save them to any location on your filesystem.

> **💡 Fun fact**: The logo for this project was generated using this very tool!

<div align="center">
<i>Generate your own amazing images with just a few lines of code!</i>
</div>

## ✨ Features

- **Powerful Image Generation**: Uses OpenAI's state-of-the-art DALL-E 3 model
- **Direct Cursor Integration**: Works seamlessly within your editor
- **Flexible Output Paths**: Save images anywhere on your filesystem
- **Automatic Directory Creation**: Directories are created if they don't exist
- **Smart File Extension Handling**: `.png` extension is added automatically

## 🔄 Cross-Platform Compatibility

Since this is an MCP (Model Context Protocol) server, it's compatible with **any application that supports the MCP protocol**, not just Cursor!

### Compatible Applications

- **[Cursor](https://cursor.sh/)**: AI-powered code editor
- **[Claude Desktop](https://claude.ai/desktop)**: Anthropic's standalone Claude application
- **[Windsurf](https://www.windsurf.ai/)**: AI-powered browser
- **[Cline](https://cline.tools/)**: Command-line AI interface
- **Any other MCP-compatible application**

Simply follow the installation instructions for your specific platform, and the image generation capabilities will be available in any MCP-supporting tool you use!

## 📋 Requirements

- Node.js 18 or higher
- An OpenAI API key with DALL-E access
- Cursor editor

## 🚀 Quick Start

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/image-generator-mcp-server.git
cd image-generator-mcp-server

# Install dependencies
npm install

# Build the project
npm run build

# Link globally for Cursor to detect
npm link
```

### Configuration

Create a `.env` file in the project root:

```
OPENAI_API_KEY=your_openai_api_key_here
```

### Platform-Specific Setup

#### Cursor

No additional configuration needed after running `npm link`. Just restart Cursor, and the tool will be available.

#### Claude Desktop

Add the server configuration to Claude Desktop's config file:

**MacOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`  
**Windows**: `%APPDATA%/Claude/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "image-generator": {
      "command": "image-generator",
      "env": {
        "OPENAI_API_KEY": "your_openai_api_key_here"
      }
    }
  }
}
```

#### Other MCP Applications

Most MCP-compatible applications have a similar configuration process:

1. Install and link the package globally: `npm link`
2. Configure the application to recognize the `image-generator` command
3. Set the OPENAI_API_KEY environment variable
4. Restart the application

Consult your specific application's documentation for detailed MCP server integration steps.

### Usage in Cursor

Restart Cursor after installation, then use:

```javascript
mcp_dalle_generate_image({
  prompt: "A beautiful mountain landscape with a lake reflecting the sunset", 
  outputPath: "/Users/yourusername/Pictures/generated_images/landscape"
})
```

### Using with Cursor Agent

Cursor's AI assistant can be instructed to generate images for your projects through natural language prompts. This is especially powerful when building websites, creating assets, or designing UI elements.

#### Example Workflow

1. **Ask the agent to generate an image for your project**:

   ```
   Create a hero image for my travel website featuring a tropical beach sunset
   ```

2. **The agent will use the tool with appropriate parameters**:

   ```javascript
   mcp_dalle_generate_image({
     prompt: "A stunning tropical beach at sunset with golden light reflecting on gentle waves, palm trees silhouetted against an orange and purple sky, perfect for a travel website hero image",
     outputPath: "/Users/yourusername/myproject/public/images/hero-sunset"
   })
   ```

3. **Use the generated image in your code**:
   
   The agent can help you incorporate the image into your project:

   ```html
   <div class="hero">
     <img src="/images/hero-sunset.png" alt="Tropical beach sunset" />
     <h1>Discover Paradise</h1>
   </div>
   ```

#### Tips for Effective Image Generation with the Agent

- **Be specific about style**: Mention "photorealistic," "cartoon," "minimalist," etc.
- **Describe the intended use**: "for a logo," "for a button," "for a background"
- **Specify dimensions in your prompt**: "create a wide banner image," "create a square profile picture"
- **Request variations**: Ask the agent to generate multiple versions with slight prompt modifications
- **Include art direction**: "in the style of Monet," "with vibrant colors," "with a dark, moody atmosphere"

#### Common Use Cases

- **Website Assets**: "Generate icons for my navigation menu with a consistent blue theme"
- **UI Components**: "Create button backgrounds with a subtle gradient"
- **Blog Images**: "Generate a featured image for my article about machine learning"
- **App Mockups**: "Create screen mockups for my fitness tracking app"
- **Placeholder Content**: "Generate placeholder product images for my e-commerce site"
- **Marketing Materials**: "Create social media banner images for my product launch"

During development, you can quickly iterate by asking the Cursor agent to modify existing images: "Generate a lighter version of the previous logo" or "Create the same image but in a different style."

## 📘 Documentation

### Tool Reference

#### `mcp_dalle_generate_image`

Generates an image based on a text prompt.

**Parameters:**

| Parameter | Type | Description | Required |
|-----------|------|-------------|----------|
| `prompt` | string | Text description of the image to generate | Yes |
| `outputPath` | string | Absolute path where to save the image | Yes |

**Returns:**

A success message with the saved file path and generation details.

**Example:**

```javascript
mcp_dalle_generate_image({
  prompt: "A futuristic city with flying cars and neon lights", 
  outputPath: "/Users/yourusername/Pictures/generated_images/future_city"
})
```

## 🛠️ Development

### Setup Development Environment

```bash
# Install dependencies
npm install

# Build in watch mode for development
npm run watch
```

### The Development Workflow

After making changes:

1. Build the project: `npm run build`
2. Link the package: `npm link`
3. **Restart Cursor completely**
4. Test your changes

> ⚠️ **Important**: Cursor only establishes connections to MCP servers at startup. Your changes won't take effect until Cursor is restarted, even if the tools appear to be working.

### Project Structure

```
image-generator-mcp-server/
├── src/
│   ├── index.ts         # Main server implementation
│   ├── image-generator.ts # DALL-E API interaction
│   ├── file-saver.ts    # File system operations
│   └── types.ts         # TypeScript interfaces
├── build/               # Compiled JavaScript
├── .cursorrules         # Cursor rules for the project
├── package.json         # Project dependencies
└── README.md            # This file
```

## 🐛 Troubleshooting

### Common Issues

- **"Not connected" errors**: Make sure you've restarted Cursor after building/linking.
- **Image generation fails**: Check that your OpenAI API key is valid and has DALL-E access.
- **Permission errors**: Ensure you have write permissions for the target directory.

### Debugging

You can use the MCP Inspector for debugging:

```bash
npm run inspector
```

> **⚠️ Warning**: The Inspector has a timeout of 10 seconds. Since image generation often takes longer than this, you may see timeout errors. For testing the `generate_image` tool, it's best to test directly in Cursor after rebuilding and restarting.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📜 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- OpenAI for the DALL-E 3 API
- The Model Context Protocol team for the MCP specification
- Cursor team for the editor integration
- [Sammy Lebbie (sammyl720)](https://github.com/sammyl720) for the original [image-generator-mcp-server](https://github.com/sammyl720/image-generator-mcp-server) repository that this project was forked from

---

<div align="center">
Made with ❤️ for the developer community
</div>
