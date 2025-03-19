# DALL-E Image Generator for Cursor

<div align="center">

![DALL-E Image Generator Logo](./logo.png)

**Generate beautiful AI images using DALL-E 3 directly in your Cursor editor**

[![TypeScript](https://img.shields.io/badge/TypeScript-5.8.2-blue.svg)](https://www.typescriptlang.org/)
[![OpenAI](https://img.shields.io/badge/OpenAI-DALL--E%203-green.svg)](https://openai.com/)
[![MCP](https://img.shields.io/badge/MCP-Model%20Context%20Protocol-purple.svg)](https://github.com/modelcontextprotocol/spec)

</div>

## 🌟 Overview

This is a Model Context Protocol (MCP) server that brings OpenAI's DALL-E 3 image generation capabilities directly into the Cursor editor. With a simple function call, you can generate high-quality AI images and save them to any location on your filesystem.

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

### Usage in Cursor

Restart Cursor after installation, then use:

```javascript
mcp_dalle_generate_image({
  prompt: "A beautiful mountain landscape with a lake reflecting the sunset", 
  outputPath: "/Users/yourusername/Pictures/generated_images/landscape"
})
```

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

---

<div align="center">
Made with ❤️ for the developer community
</div>
